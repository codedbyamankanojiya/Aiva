from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
import asyncio
import httpx
import websockets
from datetime import datetime
from dotenv import load_dotenv

# Pydantic models
class Role(BaseModel):
    id: str
    title: str
    description: str

class Question(BaseModel):
    id: str
    question: str
    level: str
    type: str

class RolesResponse(BaseModel):
    roles: List[Role]
class QuestionTranscript(BaseModel):
    sectionCode: str  # Keep for session identification
    questionId: str
    question: str
    transcript: str
    role: Optional[str] = ""
    level: Optional[str] = ""
    mentioned: Optional[List[str]] = []
    notMentioned: Optional[List[str]] = []
    ai_analysis: Optional[str] = ""

class SectionData(BaseModel):
    sessionId: str
    questionId: Optional[str] = ""
    question: Optional[str] = ""
    transcript: Optional[str] = ""
    timestamp: Optional[str] = ""
    role: str
    level: str
    questionsAnswered: int
    totalQuestions: int
    timeSpent: str
    completedAt: str
    sectionCode: str
    averageTimePerQuestion: str
    averageWordsPerMinute: int = 0
    questionTranscripts: Optional[List[dict]] = []

app = FastAPI(title="Aiva Interview API", version="1.0.0")

load_dotenv()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter API Integration
async def get_ai_analysis(question: str, transcript: str, mentioned: List[str], not_mentioned: List[str]) -> Dict[str, str]:
    """Send transcript to OpenRouter API for AI analysis with semantic context"""
    try:
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if not openrouter_api_key or openrouter_api_key == "your_openrouter_api_key_here":
            print("❌ OpenRouter API key not configured")
            return {"analysis": "AI analysis not available - API key not configured"}
        
        prompt = f"""You are an expert interview coach. Analyze the candidate's answer to the interview question.

Question: "{question}"

Candidate's answer: "{transcript}"

Key points mentioned by candidate: {mentioned}
Key points NOT mentioned (expected but missing): {not_mentioned}

Instructions:
- If the candidate missed important points, politely tell them what they mentioned, but explain why it's not enough and what they should include next time.
- If the candidate covered enough key points and their answer is valid, compliment them as a coach and reinforce what they did well.

Keep response short, encouraging, and actionable (1–3 sentences)."""
        
        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://aiva-interview.com"
        }
        
        data = {
            "model": os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-v3.2"),
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_analysis = result["choices"][0]["message"]["content"]
                print(f"✅ AI Coach Response: {ai_analysis}")
                return {"analysis": ai_analysis}
            else:
                print(f"❌ OpenRouter API error: {response.status_code}")
                error_text = response.text
                print(f"📝 Error details: {error_text}")
                
                # Provide helpful fallback response based on analysis
                if len(mentioned) == 0:
                    fallback = "Your answer didn't cover the expected key points. Next time, try to address the main aspects of the question more directly."
                elif len(not_mentioned) == 0:
                    fallback = "Great job! You covered all the key points well. Keep up the good work in your responses."
                else:
                    fallback = "You mentioned some good points, but consider adding the missing elements to make your answer more complete."
                
                return {"analysis": f"AI analysis temporarily unavailable. {fallback}"}
                
    except Exception as e:
        print(f"❌ OpenRouter API exception: {str(e)}")
        return {"analysis": f"AI analysis failed - {str(e)}"}

def analyze_keywords(question_id: str, transcript: str) -> Dict[str, List[str]]:
    """Simple keyword matching analysis"""
    try:
        # Load questions data
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        # Find question by ID
        target_question = None
        for role in questions_data.get('roles', []):
            for question in role.get('questions', []):
                if question.get('id') == question_id:
                    target_question = question
                    break
            if target_question:
                break
        
        if not target_question:
            return {"mentioned": [], "notMentioned": []}
        
        # Get expected keywords
        expected_keywords = target_question.get('keyPoints', [])
        transcript_lower = transcript.lower()
        
        mentioned = []
        not_mentioned = []
        
        for keyword in expected_keywords:
            keyword_words = keyword.lower().split()
            found_words = [word for word in keyword_words if word in transcript_lower]
            
            if len(found_words) >= len(keyword_words) / 2:
                mentioned.append(keyword)
                print(f"✅ CLASSIFIED AS MENTIONED ({len(found_words)}/{len(keyword_words)} words found)")
            else:
                not_mentioned.append(keyword)
                print(f"❌ CLASSIFIED AS NOT MENTIONED ({len(found_words)}/{len(keyword_words)} words found)")
        
        return {"mentioned": mentioned, "notMentioned": not_mentioned}
    except Exception as e:
        print(f"❌ Error in keyword analysis: {e}")
        return {"mentioned": [], "notMentioned": []}

def get_total_questions_for_level(role: str, level: str) -> int:
    """Get actual total questions for a specific role and level"""
    try:
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        # Find role by title
        target_role = None
        for r in questions_data.get('roles', []):
            if r.get('title') == role:
                target_role = r
                break
        
        if not target_role:
            print(f"❌ Role '{role}' not found, defaulting to 6")
            return 6
        
        # Count questions for the specific level
        questions = target_role.get('questions', [])
        level_questions = [q for q in questions if q.get('level') == level]
        total_count = len(level_questions)
        
        print(f"🔍 Found {total_count} {level} questions for role '{role}'")
        return total_count if total_count > 0 else 6
    except Exception as e:
        print(f"❌ Error calculating total questions: {e}")
        return 6

# Pydantic models
class Question(BaseModel):
    id: str
    question: str
    level: str
    type: str

class Role(BaseModel):
    id: str
    title: str
    description: str
    tags: List[str]

class QuestionsResponse(BaseModel):
    role: str
    role_id: str
    questions: List[Question]

class RolesResponse(BaseModel):
    roles: List[Role]

class SectionData(BaseModel):
    role: str
    level: str
    questionsAnswered: int
    totalQuestions: int
    timeSpent: str
    completedAt: str
    sectionCode: str
    averageTimePerQuestion: str

# Load data from JSON files
def load_questions():
    """Load questions from questions.json file"""
    try:
        with open('questions.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Questions file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in questions file")

def load_roles():
    """Load roles from questions.json file"""
    data = load_questions()
    roles = []
    
    for role_data in data.get("roles", []):
        role = Role(
            id=role_data["id"],
            title=role_data["title"],
            description=role_data["description"],
            tags=role_data["tags"]
        )
        roles.append(role)
    
    return roles
def calculate_average_time_per_question(time_spent: str, questions_answered: int) -> str:
    """Calculate average time per question from total time spent"""
    try:
        if not time_spent or questions_answered == 0:
            return ""
        
        # Parse time_spent format "MM:SS" or "HH:MM:SS"
        time_parts = time_spent.split(':')
        
        if len(time_parts) == 2:  # MM:SS format
            minutes = int(time_parts[0])
            seconds = int(time_parts[1])
            total_seconds = minutes * 60 + seconds
        elif len(time_parts) == 3:  # HH:MM:SS format
            hours = int(time_parts[0])
            minutes = int(time_parts[1])
            seconds = int(time_parts[2])
            total_seconds = hours * 3600 + minutes * 60 + seconds
        else:
            return ""
        
        # Calculate average time per question in seconds
        avg_seconds = total_seconds / questions_answered
        
        # Convert back to MM:SS format
        avg_minutes = int(avg_seconds // 60)
        avg_seconds_rem = int(avg_seconds % 60)
        
        return f"{avg_minutes:02d}:{avg_seconds_rem:02d}"
        
    except Exception as e:
        print(f"❌ Error calculating average time per question: {e}")
        return ""

def load_section_data():
    """Load section data from SectionData.json file"""
    try:
        with open('SectionData.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"sections": []}
    except json.JSONDecodeError:
        return {"sections": []}

def load_interview_data():
    """Load interview session data from interviewdata.json file"""
    file_path = os.path.join('services', 'interviewdata.json')
    try:
        if not os.path.exists('services'):
            os.makedirs('services')
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"sessions": []}

def save_interview_data(session_data: dict):
    """Save interview session data to interviewdata.json file"""
    try:
        file_path = os.path.join('services', 'interviewdata.json')
        if not os.path.exists('services'):
            os.makedirs('services')
            
        data = load_interview_data()
        
        # Check for existing session to update or append
        session_id = session_data.get("sessionId")
        updated = False
        for i, session in enumerate(data.get("sessions", [])):
            if session.get("sessionId") == session_id:
                data["sessions"][i] = session_data
                updated = True
                break
        
        if not updated:
            data["sessions"].append(session_data)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"❌ Error saving interview data: {e}")
        return False

def save_section_data(section_data: dict):
    """Save section data to SectionData.json file - FIXED VERSION"""
    try:
        print(f"🔍 DEBUG: Saving section data: {section_data}")
        
        # Load existing data
        data = load_section_data()
        
        # Ensure sections array exists
        if "sections" not in data:
            data["sections"] = []
        
        # Extract the actual section data (in case frontend sends nested structure)
        actual_section_data = section_data
        if "sections" in section_data and isinstance(section_data["sections"], list):
            # Frontend sent nested sections, take the first one
            actual_section_data = section_data["sections"][0] if section_data["sections"] else section_data
            print(f"🔍 DEBUG: Extracted actual section data from nested structure")
        
        # Find existing section with same sectionCode
        section_code = actual_section_data.get("sectionCode")
        existing_section_index = None
        
        for i, section in enumerate(data.get("sections", [])):
            if section.get("sectionCode") == section_code:
                existing_section_index = i
                break
        
        if existing_section_index is not None:
            print(f"📝 Found existing section, updating...")
            # Update existing section but preserve questionTranscripts
            existing_section = data["sections"][existing_section_index]
            
            # Preserve existing questionTranscripts
            existing_transcripts = existing_section.get("questionTranscripts", [])
            
            # Update other fields
            for key, value in actual_section_data.items():
                if key != "questionTranscripts":  # Don't overwrite transcripts
                    existing_section[key] = value
            
            # Recalculate average time per question when updating
            if "timeSpent" in actual_section_data and "questionsAnswered" in actual_section_data:
                existing_section["averageTimePerQuestion"] = calculate_average_time_per_question(
                    actual_section_data["timeSpent"], 
                    actual_section_data["questionsAnswered"]
                )
            
            # Update average WPM if provided
            if "averageWordsPerMinute" in actual_section_data:
                existing_section["averageWordsPerMinute"] = actual_section_data["averageWordsPerMinute"]
            
            # Handle new transcripts if provided
            new_transcripts = actual_section_data.get("questionTranscripts", [])
            if new_transcripts:
                # Append new transcripts that don't already exist
                existing_ids = {t.get("questionId") for t in existing_transcripts}
                print(f"🔍 DEBUG: Existing question IDs: {existing_ids}")
                print(f"🔍 DEBUG: New transcripts to add: {[t.get('questionId') for t in new_transcripts]}")
                
                for new_transcript in new_transcripts:
                    new_question_id = new_transcript.get("questionId")
                    if new_question_id not in existing_ids:
                        print(f"🔍 DEBUG: Adding new transcript for question {new_question_id}")
                        existing_transcripts.append(new_transcript)
                        existing_ids.add(new_question_id)
                    else:
                        print(f"🔍 DEBUG: Skipping duplicate transcript for question {new_question_id}")
                
                # Update the transcripts array
                existing_section["questionTranscripts"] = existing_transcripts
                existing_section["questionsAnswered"] = len(existing_transcripts)
                print(f"🔍 DEBUG: Updated questionsAnswered to: {len(existing_transcripts)}")
        else:
            print(f"🆕 Creating new section entry")
            # Add new section
            data["sections"].append(actual_section_data)
        
        with open('SectionData.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Section data saved successfully")
        return True
    except Exception as e:
        print(f"❌ Error saving section data: {e}")
        return False
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Aiva Interview API is running"}

@app.get("/api/questions/{role_id}", response_model=QuestionsResponse)
async def get_questions(role_id: str, level: Optional[str] = None):
    """
    Get questions for a specific role and level
    
    Args:
        role_id: The ID of the role (e.g., 'software-engineer')
        level: Optional level filter ('Beginner', 'Intermediate', 'Advanced')
    """
    try:
        questions_data = load_questions()
        
        # Find questions for the role
        role_questions = None
        for role in questions_data["roles"]:
            if role["id"] == role_id:
                role_questions = role
                break
        
        if not role_questions:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Filter by level if specified
        if level:
            filtered_questions = [
                Question(**q) for q in role_questions["questions"] 
                if q.get("level") == level or q.get("level") == "all"
            ]
        else:
            filtered_questions = [
                Question(**q) for q in role_questions["questions"]
            ]
        
        return QuestionsResponse(
            role=role_questions["title"],
            role_id=role_questions["id"],
            questions=filtered_questions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vision-session")
async def save_section_data_endpoint(section_data: SectionData):
    """
    Save interview section data to SectionData.json
    
    Args:
        section_data: Interview session data to save
    """
    try:
        success = save_section_data(section_data.dict())
        if success:
            return {"message": "Section data saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save section data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving section data: {str(e)}")

@app.get("/api/section-data")
async def get_section_data():
    """
    Get all section data from SectionData.json
    
    Returns:
        Dictionary containing all saved section data
    """
    try:
        data = load_section_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading section data: {str(e)}")

class QuestionTranscript(BaseModel):
    sessionId: str
    questionId: str
    question: str
    transcript: str
    timestamp: str
    sectionCode: str
    role: Optional[str] = ""
    level: Optional[str] = ""
    totalQuestions: Optional[int] = 0
    mentioned: Optional[List[str]] = []
    notMentioned: Optional[List[str]] = []
@app.post("/api/question-transcript")
async def save_question_transcript(transcript_data: QuestionTranscript):
    """Save individual question transcript to SectionData.json"""
    try:
        print(f"🔍 Saving transcript for section: {transcript_data.sectionCode}")
        print(f"🔍 Question ID: {transcript_data.questionId}")
        
        # Perform keyword analysis
        keyword_analysis = analyze_keywords(transcript_data.questionId, transcript_data.transcript)
        print(f"🔍 Keyword Analysis: {keyword_analysis}")
        
        # Update transcript data with keyword analysis results
        transcript_data.mentioned = keyword_analysis["mentioned"]
        transcript_data.notMentioned = keyword_analysis["notMentioned"]
        
        # Trigger AI analysis
        ai_result = await get_ai_analysis(
            transcript_data.question, 
            transcript_data.transcript,
            transcript_data.mentioned,
            transcript_data.notMentioned
        )
        
        # Add AI analysis to transcript data
        ai_analysis_text = ai_result.get("analysis", "AI analysis not available")
        print(f"🤖 Generated AI Analysis: {ai_analysis_text}")
        
        # Calculate actual total questions for this role and level
        actual_total_questions = get_total_questions_for_level(transcript_data.role, transcript_data.level)
        
        # Load existing data to update properly
        data = load_section_data()
        section_code = transcript_data.sectionCode
        existing_section = None
        
        # Find existing section
        for section in data.get("sections", []):
            if section.get("sectionCode") == section_code:
                existing_section = section
                break
        
        if existing_section:
            print(f"📝 Found existing section, updating...")
            print(f"📝 Current transcripts count: {len(existing_section.get('questionTranscripts', []))}")
            
            # Update existing section with new transcript
            if "questionTranscripts" not in existing_section:
                existing_section["questionTranscripts"] = []
            
            # Check if this question already exists
            existing_question_ids = {t.get("questionId") for t in existing_section["questionTranscripts"]}
            print(f"🔍 DEBUG: Existing question IDs in section: {existing_question_ids}")
            print(f"🔍 DEBUG: Attempting to add question ID: {transcript_data.questionId}")
            
            if transcript_data.questionId in existing_question_ids:
                print(f"⚠️ Question {transcript_data.questionId} already exists in section {section_code}")
                # Update existing transcript instead of adding duplicate
                for i, existing_transcript in enumerate(existing_section["questionTranscripts"]):
                    if existing_transcript.get("questionId") == transcript_data.questionId:
                        print(f"🔄 Updating existing transcript at index {i}")
                        existing_section["questionTranscripts"][i] = {
                            "questionId": transcript_data.questionId,
                            "question": transcript_data.question,
                            "transcript": transcript_data.transcript,
                            "role": transcript_data.role,
                            "level": transcript_data.level,
                            "mentioned": transcript_data.mentioned,
                            "notMentioned": transcript_data.notMentioned,
                            "ai_analysis": ai_analysis_text
                        }
                        break
            else:
                print(f"➕ Adding new transcript for question {transcript_data.questionId}")
                
                # Create clean transcript object without redundant fields
                clean_transcript = {
                    "questionId": transcript_data.questionId,
                    "question": transcript_data.question,
                    "transcript": transcript_data.transcript,
                    "role": transcript_data.role,
                    "level": transcript_data.level,
                    "mentioned": transcript_data.mentioned,
                    "notMentioned": transcript_data.notMentioned,
                    "ai_analysis": ai_analysis_text
                }
                
                print(f"📝 Adding transcript with AI analysis for question {transcript_data.questionId}")
                print(f"🤖 AI Analysis included: {ai_analysis_text[:100]}...")
                
                existing_section["questionTranscripts"].append(clean_transcript)
            existing_section["questionsAnswered"] = len(existing_section["questionTranscripts"])
            existing_section["completedAt"] = datetime.now().isoformat()
            
            # Save the entire data structure directly
            with open('SectionData.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Successfully saved transcript with AI analysis for question {transcript_data.questionId}")
            return True
        else:
            print(f"🆕 Creating new section entry")
            # Create new section
            section_data_dict = {
                "role": transcript_data.role,
                "level": transcript_data.level,
                "questionsAnswered": 1,
                "totalQuestions": actual_total_questions,
                "timeSpent": "",
                "completedAt": datetime.now().isoformat(),
                "sectionCode": transcript_data.sectionCode,
                "averageTimePerQuestion": "00:00",  # Single question, no average yet
                "averageWordsPerMinute": 0,  # Will be updated when session ends
                "questionTranscripts": [{
                    "questionId": transcript_data.questionId,
                    "question": transcript_data.question,
                    "transcript": transcript_data.transcript,
                    "role": transcript_data.role,
                    "level": transcript_data.level,
                    "mentioned": transcript_data.mentioned,
                    "notMentioned": transcript_data.notMentioned,
                    "ai_analysis": ai_analysis_text
                }]
            }
            
            # Add new section to data and save directly
            data["sections"].append(section_data_dict)
            with open('SectionData.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Successfully created new section and saved transcript for question {transcript_data.questionId}")
            return True
        
        return {"success": True, "ai_analysis": ai_analysis_text, "sectionUpdated": True}
        
    except Exception as e:
        print(f"❌ Error saving question transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving question transcript: {str(e)}")

@app.post("/api/ai-analysis")
async def ai_analysis_endpoint(request: dict):
    """DEPRECATED - AI analysis is now handled internally in /api/question-transcript"""
    return {"success": False, "analysis": "This endpoint is deprecated. Use /api/question-transcript instead."}

@app.post("/api/semantic-analysis") 
async def semantic_analysis_endpoint(request: dict):
    """DEPRECATED - Semantic analysis is now handled internally in /api/question-transcript"""
    return {"success": False, "mentioned": [], "notMentioned": "This endpoint is deprecated. Use /api/question-transcript instead."}

@app.post("/api/section-data")
async def save_section_data_endpoint(request: dict):
    """Save interview section data - handles frontend data structure"""
    try:
        print(f"🔍 DEBUG: Received raw frontend data: {request}")
        
        # Extract data from frontend request
        role = request.get("role", "")
        level = request.get("level", "")
        questions_answered = request.get("questionsAnswered", 0)
        total_questions = request.get("totalQuestions", 0)
        time_spent = request.get("timeSpent", "")
        completed_at = request.get("completedAt", "")
        section_code = request.get("sectionCode", "")
        session_id = request.get("sessionId", "")
        
        # Handle transcripts from frontend - use the processed ones with keyword analysis
        question_transcripts = request.get("questionTranscripts", [])
        
        print(f"🔍 DEBUG: Extracted - role={role}, level={level}, questions={questions_answered}")
        print(f"🔍 DEBUG: Q-Transcripts count: {len(question_transcripts)}")
        
        # Validate required fields
        if not role or not level:
            print(f"❌ DEBUG: Missing required fields: role={role}, level={level}")
            raise HTTPException(status_code=400, detail="Missing required fields: role and level")
        
        # Create section data structure
        section_data_dict = {
            "role": role,
            "level": level,
            "questionsAnswered": questions_answered,
            "totalQuestions": total_questions,
            "timeSpent": time_spent,
            "completedAt": completed_at,
            "sectionCode": section_code,
            "averageTimePerQuestion": calculate_average_time_per_question(time_spent, questions_answered),
            "averageWordsPerMinute": request.get("averageWordsPerMinute", 0),
            "questionTranscripts": question_transcripts
        }
        
        print(f"🔍 DEBUG: Section data to save: {section_data_dict}")
        
        success = save_section_data(section_data_dict)
        if success:
            return {"message": "Section data saved successfully", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save section data")
            
    except Exception as e:
        print(f"❌ DEBUG: Error in save_section_data_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving section data: {str(e)}")

@app.get("/api/roles")
async def get_roles():
    """Get all available roles"""
    try:
        print(f"🔍 DEBUG: get_roles endpoint called")
        
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        print(f"🔍 DEBUG: questions_data loaded: {len(questions_data.get('roles', []))} roles")
        
        roles = []
        for role in questions_data.get('roles', []):
            role_data = {
                "id": role.get('id', ''),
                "title": role.get('title', ''),
                "description": role.get('description', ''),
                "tags": role.get('tags', [])  # Include tags!
            }
            roles.append(role_data)
            print(f"🔍 DEBUG: Added role: {role.get('title', 'Unknown')} with {len(role.get('tags', []))} tags")
        
        print(f"🔍 DEBUG: Returning {len(roles)} roles")
        return RolesResponse(roles=roles)
    except Exception as e:
        print(f"❌ DEBUG: Error in get_roles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading roles: {str(e)}")

@app.websocket("/ws/stt")
async def stt_websocket(websocket: WebSocket):
    await websocket.accept()

    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        await websocket.send_text(json.dumps({"type": "error", "message": "DEEPGRAM_API_KEY not configured"}))
        await websocket.close(code=1011)
        return

    # Check if API key looks valid (basic format check)
    if len(api_key) < 10:
        await websocket.send_text(json.dumps({"type": "error", "message": "Invalid Deepgram API key format"}))
        await websocket.close(code=1011)
        return

    deepgram_url = (
        "wss://api.deepgram.com/v1/listen"
        "?model=nova-3"
        "&encoding=linear16"
        "&sample_rate=16000"
        "&interim_results=true"
        "&endpointing=300"
        "&punctuate=true"
        "&smart_format=true"
    )

    try:
        async with websockets.connect(
            deepgram_url,
            extra_headers={"Authorization": f"Token {api_key}"},
            ping_interval=10,  # Reduced for better responsiveness
            ping_timeout=10,
            close_timeout=10,  # Increased for long waits
            max_size=2**23,
        ) as dg:

            async def client_to_deepgram():
                try:
                    while True:
                        try:
                            message = await websocket.receive()
                        except asyncio.CancelledError:
                            print("🔌 WebSocket receive cancelled")
                            return
                        if message.get("type") == "websocket.disconnect":
                            return  # Use return instead of break
                        data = message.get("bytes")
                        if data is None:
                            continue
                        try:
                            await dg.send(data)
                        except asyncio.CancelledError:
                            print("🔌 Deepgram send cancelled")
                            return
                except WebSocketDisconnect:
                    print("🔌 Client disconnected from client_to_deepgram")
                    return  # Use return instead of break
                except asyncio.CancelledError:
                    print("🔌 client_to_deepgram cancelled")
                    return
                except Exception as e:
                    print(f"❌ Error in client_to_deepgram: {e}")
                    return  # Use return instead of break
                finally:
                    try:
                        await dg.send(json.dumps({"type": "CloseStream"}))
                    except Exception:
                        pass

            async def deepgram_to_client():
                try:
                    async for raw in dg:
                        try:
                            payload = json.loads(raw)
                        except Exception:
                            continue

                        channel = payload.get("channel") or {}
                        alternatives = channel.get("alternatives") or []
                        transcript = ""
                        if alternatives and isinstance(alternatives, list):
                            transcript = (alternatives[0] or {}).get("transcript") or ""

                        is_final = bool(payload.get("is_final"))
                        if transcript:
                            try:
                                await websocket.send_text(
                                    json.dumps(
                                        {
                                            "type": "transcript",
                                            "transcript": transcript,
                                            "is_final": is_final,
                                        }
                                    )
                                )
                            except asyncio.CancelledError:
                                print("🔌 WebSocket send cancelled")
                                return
                except websockets.exceptions.ConnectionClosed:
                    print("🔌 Deepgram connection closed in deepgram_to_client")
                    return  # Use return instead of break
                except asyncio.CancelledError:
                    print("🔌 deepgram_to_client cancelled")
                    return
                except Exception as e:
                    print(f"❌ Error in deepgram_to_client: {e}")
                    return  # Use return instead of break

            # Run both tasks concurrently with better error handling
            try:
                await asyncio.gather(
                    client_to_deepgram(), 
                    deepgram_to_client(),
                    return_exceptions=True
                )
            except asyncio.CancelledError:
                print("🔌 WebSocket tasks cancelled")
            except Exception as e:
                print(f"❌ Error in WebSocket gather: {e}")

    except websockets.exceptions.ConnectionClosed:
        print("🔌 WebSocket connection closed")
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": "Connection closed"}))
        except Exception:
            pass
    except asyncio.CancelledError:
        print("🔌 WebSocket cancelled during shutdown")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
        except Exception:
            pass
        try:
            await websocket.close(code=1011)
        except Exception:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

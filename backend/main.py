from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
import asyncio
import httpx
import websockets
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
    ai_analysis: Optional[str] = ""

class SectionData(BaseModel):
    role: str
    level: str
    questionsAnswered: int
    totalQuestions: int
    timeSpent: str
    completedAt: str
    sectionCode: str
    averageTimePerQuestion: str
    questionTranscripts: List[QuestionTranscript] = []

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
                return {"analysis": f"AI analysis failed - API error: {response.status_code}"}
                
    except Exception as e:
        print(f"❌ OpenRouter API exception: {str(e)}")
        return {"analysis": f"AI analysis failed - {str(e)}"}

def analyze_keywords(question_id: str, transcript: str) -> Dict[str, List[str]]:
    """Simple keyword matching analysis"""
    try:
        # Load questions data
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        # Find question and its keyPoints
        key_points = []
        for role in questions_data.get('roles', []):
            for question in role.get('questions', []):
                if question.get('id') == question_id:
                    key_points = question.get('keyPoints', [])
                    break
            if key_points:
                break
        
        if not key_points:
            return {"mentioned": [], "notMentioned": []}
        
        if not transcript or transcript.strip() == "":
            return {"mentioned": [], "notMentioned": key_points}
        
        # Clean and prepare transcript
        transcript_clean = transcript.strip().lower()
        
        mentioned = []
        not_mentioned = []
        
        # Simple keyword matching
        for key_point in key_points:
            key_point_lower = key_point.lower()
            
            print(f"🔍 Keyword Analysis - Key Point: '{key_point}'")
            
            # Check if any significant part of key point is in transcript
            key_words = key_point_lower.split()
            words_found = 0
            
            for word in key_words:
                if word in transcript_clean:
                    words_found += 1
            
            # If at least 50% of words are found, consider it mentioned
            if len(key_words) > 0 and words_found / len(key_words) >= 0.5:
                mentioned.append(key_point)
                print(f"✅ CLASSIFIED AS MENTIONED ({words_found}/{len(key_words)} words found)")
            else:
                not_mentioned.append(key_point)
                print(f"❌ CLASSIFIED AS NOT MENTIONED ({words_found}/{len(key_words)} words found)")
        
        result = {
            "mentioned": mentioned,
            "notMentioned": not_mentioned
        }
        
        print(f"🔍 Final Keyword Analysis Result: {result}")
        return result
        
    except Exception as e:
        print(f"Error in keyword analysis: {str(e)}")
        return {"mentioned": [], "notMentioned": []}

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

# Vision System Models
class IrisCoord(BaseModel):
    x: float
    y: float
    z: float

class MeshCentroid(BaseModel):
    x: float
    y: float

class FaceMetrics(BaseModel):
    faceDetected: bool
    eyeContact: bool
    irisCoords: List[IrisCoord]
    meshCentroid: MeshCentroid
    yawDeg: float
    pitchDeg: float
    focusScore: float

class MovementMetrics(BaseModel):
    bodyPresent: bool
    postureScore: float
    movementDelta: float
    excessiveMovement: bool

class FrameSnapshot(BaseModel):
    t: int
    face: FaceMetrics
    movement: MovementMetrics
    latencyMs: float

class SessionSummary(BaseModel):
    avgFocus: int
    eyeContactPercent: int
    totalMovementSpikes: int
    durationSeconds: int

class InterviewSessionData(BaseModel):
    sessionId: str
    timestamp: int
    frames: List[FrameSnapshot]
    summary: SessionSummary

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
    """Save section data to SectionData.json file - SIMPLE VERSION"""
    try:
        print(f"🔍 DEBUG: Saving section data: {section_data}")
        
        # Load existing data
        data = load_section_data()
        
        # Find existing section with same sectionCode
        section_code = section_data.get("sectionCode")
        existing_section = None
        
        for section in data.get("sections", []):
            if section.get("sectionCode") == section_code:
                existing_section = section
                break
        
        if existing_section:
            print(f"📝 Found existing section, updating...")
            # Update existing section
            for key, value in section_data.items():
                if key != "questionTranscripts":  # Don't overwrite transcripts
                    existing_section[key] = value
            
            # Add new transcript to existing section
            if "questionTranscripts" in section_data:
                for transcript_data in section_data["questionTranscripts"]:
                    existing_section["questionTranscripts"].append(transcript_data)
            
        else:
            print(f"🆕 Creating new section entry")
            # Add new section
            data["sections"].append(section_data)
        
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

@app.get("/api/roles", response_model=RolesResponse)
async def get_roles():
    """
    Get all available roles for interview preparation
    """
    try:
        roles = load_roles()
        return {"roles": roles}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@app.get("/api/sections/{section_code}")
async def get_section_info(section_code: str):
    """
    Get information about a specific section code
    
    Args:
        section_code: The unique section identifier
    """
    return {
        "section_code": section_code,
        "status": "active",
        "message": "Section is valid"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Aiva Interview API"}

@app.post("/api/section-data")
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

@app.post("/api/vision-session")
async def save_vision_session(session_data: InterviewSessionData):
    """
    Save vision session metrics to interviewdata.json
    
    Args:
        session_data: Vision metrics data to save
    """
    try:
        success = save_interview_data(session_data.dict())
        if success:
            return {"message": "Vision session data saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save vision session data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving vision session data: {str(e)}")

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
        transcript_data.ai_analysis = ai_result.get("analysis", "AI analysis not available")
        
        # Save to SectionData.json
        section_data_dict = {
            "role": transcript_data.role,
            "level": transcript_data.level,
            "questionsAnswered": 1,
            "totalQuestions": transcript_data.totalQuestions,
            "timeSpent": "",
            "completedAt": transcript_data.timestamp,
            "sectionCode": transcript_data.sectionCode,
            "averageTimePerQuestion": "",
            "questionTranscripts": [transcript_data.model_dump()]
        }
        
        success = save_section_data(section_data_dict)
        
        return {"success": True, "ai_analysis": transcript_data.ai_analysis, "sectionUpdated": True}
        
    except Exception as e:
        print(f"❌ Error saving question transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving question transcript: {str(e)}")

@app.post("/api/semantic-analysis")
async def semantic_analysis_endpoint(request: dict):
    """Semantic analysis endpoint"""
    try:
        question_id = request.get("questionId", "")
        transcript = request.get("transcript", "")
        
        if not question_id or not transcript:
            raise HTTPException(status_code=400, detail="Question ID and transcript are required")
        
        result = analyze_keywords(question_id, transcript)
        return {"success": True, "mentioned": result.get("mentioned", []), "notMentioned": result.get("notMentioned", [])}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Semantic analysis failed: {str(e)}")

@app.post("/api/ai-analysis")
async def ai_analysis_endpoint(request: dict):
    """AI analysis endpoint"""
    try:
        question = request.get("question", "")
        transcript = request.get("transcript", "")
        mentioned = request.get("mentioned", [])
        not_mentioned = request.get("notMentioned", [])
        
        if not question or not transcript:
            raise HTTPException(status_code=400, detail="Question and transcript are required")
        
        result = await get_ai_analysis(question, transcript, mentioned, not_mentioned)
        return {"success": True, "analysis": result.get("analysis", "Analysis failed")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.post("/api/section-data")
async def save_section_data_endpoint(section_data: SectionData):
    """Save interview section data"""
    try:
        print(f"🔍 DEBUG: Received section data: {section_data.model_dump()}")
        
        # Extract only section data, not any nested sections
        clean_data = {
            "role": section_data.role,
            "level": section_data.level,
            "questionsAnswered": section_data.questionsAnswered,
            "totalQuestions": section_data.totalQuestions,
            "timeSpent": section_data.timeSpent,
            "completedAt": section_data.completedAt,
            "sectionCode": section_data.sectionCode,
            "averageTimePerQuestion": section_data.averageTimePerQuestion,
            "questionTranscripts": section_data.questionTranscripts if hasattr(section_data, 'questionTranscripts') else []
        }
        
        print(f"🔍 DEBUG: Clean data to save: {clean_data}")
        
        success = save_section_data(clean_data)
        if success:
            return {"message": "Section data saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save section data")
    except Exception as e:
        print(f"❌ DEBUG: Error in save_section_data_endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving section data: {str(e)}")

@app.get("/api/section-data")
async def get_section_data():
    """Get all section data"""
    try:
        data = load_section_data()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading section data: {str(e)}")

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

@app.get("/api/questions/{role_id}")
async def get_questions(role_id: str, level: str = "Beginner"):
    """Get questions for a specific role and level"""
    try:
        print(f"🔍 DEBUG: get_questions called with role_id='{role_id}', level='{level}'")
        
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        # Find role
        target_role = None
        for role in questions_data.get('roles', []):
            if role.get('id') == role_id:
                target_role = role
                break
        
        if not target_role:
            print(f"🔍 DEBUG: Role '{role_id}' not found")
            raise HTTPException(status_code=404, detail=f"Role '{role_id}' not found")
        
        # Filter questions by level
        questions = target_role.get('questions', [])
        print(f"🔍 DEBUG: Found {len(questions)} questions for role '{target_role.get('title', 'Unknown')}'")
        
        return {"questions": questions}
    except Exception as e:
        print(f"❌ DEBUG: Error in get_questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading questions: {str(e)}")

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
            ping_interval=20,
            ping_timeout=20,
            close_timeout=5,
            max_size=2**23,
        ) as dg:

            async def client_to_deepgram():
                try:
                    while True:
                        message = await websocket.receive()
                        if message.get("type") == "websocket.disconnect":
                            break
                        data = message.get("bytes")
                        if data is None:
                            continue
                        await dg.send(data)
                except WebSocketDisconnect:
                    pass
                except Exception:
                    pass
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
                            await websocket.send_text(
                                json.dumps(
                                    {
                                        "type": "transcript",
                                        "transcript": transcript,
                                        "is_final": is_final,
                                    }
                                )
                            )
                except Exception:
                    pass

            await asyncio.gather(client_to_deepgram(), deepgram_to_client())

    except Exception as e:
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

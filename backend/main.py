from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import json
import os
import asyncio
import re

from dotenv import load_dotenv
import websockets

# Semantic similarity imports
from sentence_transformers import SentenceTransformer, util
import torch

# Initialize model globally (only once)
model = SentenceTransformer('all-MiniLM-L6-v2')

app = FastAPI(title="Aiva Interview API", version="1.0.0")

load_dotenv()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_keywords(question_id: str, transcript: str) -> Dict[str, List[str]]:
    """
    Analyze which keyPoints from a question are semantically similar to the transcript
    
    Args:
        question_id: The ID of the question to analyze
        transcript: The user's transcript to analyze
        
    Returns:
        Dictionary with 'mentioned' and 'notMentioned' keyPoints based on semantic similarity
    """
    try:
        # Load questions data
        with open('questions.json', 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
        
        # Find the question and its keyPoints
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
        transcript_clean = transcript.strip()
        
        # Generate embeddings for the transcript
        transcript_embedding = model.encode(transcript_clean, convert_to_tensor=True)
        
        mentioned = []
        not_mentioned = []
        
        # Set similarity threshold (can be adjusted)
        similarity_threshold = 0.3  # Lowered threshold for better sensitivity
        
        for key_point in key_points:
            # Generate embedding for the key point
            key_point_embedding = model.encode(key_point, convert_to_tensor=True)
            
            # Calculate cosine similarity
            similarity_score = util.cos_sim(transcript_embedding, key_point_embedding).item()
            
            print(f"🔍 Semantic Analysis - Key Point: '{key_point}'")
            print(f"🔍 Similarity Score: {similarity_score:.4f}")
            print(f"🔍 Threshold: {similarity_threshold}")
            
            # Classify based on similarity threshold
            if similarity_score >= similarity_threshold:
                mentioned.append(key_point)
                print(f"✅ CLASSIFIED AS MENTIONED")
            else:
                not_mentioned.append(key_point)
                print(f"❌ CLASSIFIED AS NOT MENTIONED")
        
        result = {
            "mentioned": mentioned,
            "notMentioned": not_mentioned
        }
        
        print(f"🔍 Final Semantic Analysis Result: {result}")
        return result
        
    except Exception as e:
        print(f"Error in semantic analysis: {str(e)}")
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

def save_section_data(section_data: dict):
    """Save section data to SectionData.json file"""
    try:
        print(f"🔍 Saving section data for section: {section_data.get('sectionCode')}")
        print(f"🔍 Role: {section_data.get('role')}, Level: {section_data.get('level')}")
        
        data = load_section_data()
        
        # Find existing section with same sectionCode to merge data
        section_code = section_data.get("sectionCode")
        existing_section = None
        
        for section in data.get("sections", []):
            if section.get("sectionCode") == section_code:
                existing_section = section
                break
        
        if existing_section:
            print(f"📝 Found existing section, merging data...")
            print(f"📊 Existing role: {existing_section.get('role', 'NOT SET')}")
            print(f"📊 Existing level: {existing_section.get('level', 'NOT SET')}")
            print(f"📊 Existing questionTranscripts: {len(existing_section.get('questionTranscripts', []))}")
            
            # Merge data with existing section
            existing_section.update(section_data)
            # Preserve questionTranscripts if they exist
            if "questionTranscripts" not in existing_section and "questionTranscripts" in section_data:
                existing_section["questionTranscripts"] = section_data["questionTranscripts"]
            
            print(f"✅ Merged section data. New role: {existing_section.get('role')}")
        else:
            print(f"🆕 Creating new section entry")
            # Add new section if not found
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
    """
    Save individual question transcript to SectionData.json with questionTranscripts field
    
    Args:
        transcript_data: Question transcript data to save
    """
    try:
        print(f"🔍 Saving transcript for section: {transcript_data.sectionCode}")
        print(f"🔍 Question ID: {transcript_data.questionId}")
        print(f"🔍 Session Data - Role: '{transcript_data.role}', Level: '{transcript_data.level}'")
        print(f"🔍 Total Questions: {transcript_data.totalQuestions}")
        print(f"🔍 Full transcript data: {transcript_data.dict()}")
        
        # Perform keyword analysis
        keyword_analysis = analyze_keywords(transcript_data.questionId, transcript_data.transcript)
        print(f"🔍 Keyword Analysis: {keyword_analysis}")
        
        # Update transcript data with keyword analysis results
        transcript_data.mentioned = keyword_analysis["mentioned"]
        transcript_data.notMentioned = keyword_analysis["notMentioned"]
        
        # Load existing section data
        data = load_section_data()
        
        # Find existing section entry for this session
        section_entry = None
        for section in data.get("sections", []):
            if section.get("sectionCode") == transcript_data.sectionCode:
                section_entry = section
                break
        
        if not section_entry:
            print(f"🆕 Creating new section for {transcript_data.sectionCode}")
            
            # Try to get role info from questions data if not provided
            role_info = {"title": "", "level": ""}
            try:
                questions_data = load_questions()
                for role in questions_data.get("roles", []):
                    if role.get("id") == transcript_data.sectionCode or any(q.get("id") == transcript_data.questionId for q in role.get("questions", [])):
                        role_info = {"title": role.get("title", ""), "level": transcript_data.level or "Intermediate"}
                        break
            except:
                pass
            
            # Create new section entry with actual data
            section_entry = {
                "role": transcript_data.role or role_info["title"],  # Use provided or inferred role
                "level": transcript_data.level or role_info["level"],  # Use provided or inferred level
                "questionsAnswered": 0,
                "totalQuestions": transcript_data.totalQuestions or 6,  # Use provided or default
                "timeSpent": "",
                "completedAt": transcript_data.timestamp,
                "sectionCode": transcript_data.sectionCode,
                "averageTimePerQuestion": "",
                "questionTranscripts": []
            }
            print(f"🔍 Creating section with data: {section_entry}")
            data["sections"].append(section_entry)
        else:
            print(f"📝 Found existing section for {transcript_data.sectionCode}")
            print(f"📊 Current role: {section_entry.get('role', 'NOT SET')}")
            print(f"📊 Current level: {section_entry.get('level', 'NOT SET')}")
            
            # Try to get role info from questions data if fields are empty
            role_info = {"title": "", "level": ""}
            if not section_entry.get('role') or not section_entry.get('level'):
                try:
                    questions_data = load_questions()
                    for role in questions_data.get("roles", []):
                        if role.get("id") == transcript_data.sectionCode or any(q.get("id") == transcript_data.questionId for q in role.get("questions", [])):
                            role_info = {"title": role.get("title", ""), "level": transcript_data.level or "Intermediate"}
                            break
                except:
                    pass
            
            # Fill in missing session data if available
            if not section_entry.get('role'):
                section_entry['role'] = transcript_data.role or role_info["title"]
                print(f"✅ Updated role to: {section_entry['role']}")
            
            if not section_entry.get('level'):
                section_entry['level'] = transcript_data.level or role_info["level"]
                print(f"✅ Updated level to: {section_entry['level']}")
            
            if not section_entry.get('totalQuestions') and transcript_data.totalQuestions:
                section_entry['totalQuestions'] = transcript_data.totalQuestions
                print(f"✅ Updated totalQuestions to: {transcript_data.totalQuestions}")
        
        # Initialize questionTranscripts field if not exists
        if "questionTranscripts" not in section_entry:
            section_entry["questionTranscripts"] = []
        
        # Add new question transcript (avoid duplicates)
        transcript_exists = False
        for existing_transcript in section_entry["questionTranscripts"]:
            if (existing_transcript.get("questionId") == transcript_data.questionId and 
                existing_transcript.get("timestamp") == transcript_data.timestamp):
                transcript_exists = True
                break
        
        if not transcript_exists:
            section_entry["questionTranscripts"].append({
                "questionId": transcript_data.questionId,
                "question": transcript_data.question,
                "transcript": transcript_data.transcript,
                "timestamp": transcript_data.timestamp,
                "mentioned": transcript_data.mentioned,
                "notMentioned": transcript_data.notMentioned
            })
            print(f"✅ Added transcript for question {transcript_data.questionId}")
        else:
            print(f"⚠️ Transcript already exists for question {transcript_data.questionId}")
        
        # Update questions answered count
        section_entry["questionsAnswered"] = len(section_entry["questionTranscripts"])
        
        # Save updated data
        with open('SectionData.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved section data. Total questions answered: {len(section_entry['questionTranscripts'])}")
        
        return {
            "message": "Question transcript saved successfully", 
            "questionsAnswered": len(section_entry["questionTranscripts"]),
            "sectionUpdated": bool(section_entry)
        }
        
    except Exception as e:
        print(f"❌ Error saving question transcript: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving question transcript: {str(e)}")


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

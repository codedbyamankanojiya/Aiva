from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os

app = FastAPI(title="Aiva Interview API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    sessionStartTime: str
    sessionEndTime: str
    totalAttendanceTime: str
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
        data = load_section_data()
        data["sections"].append(section_data)
        
        with open('SectionData.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"Error saving section data: {e}")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

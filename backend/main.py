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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

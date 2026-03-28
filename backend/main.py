from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from typing import Dict, List, Optional

app = FastAPI(title="Aiva Interview API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load questions from JSON file
def load_questions():
    questions_path = os.path.join(os.path.dirname(__file__), "questions.json")
    with open(questions_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/")
async def root():
    return {"message": "Aiva Interview API is running"}

@app.get("/api/questions/{role_id}")
async def get_questions(role_id: str, level: Optional[str] = None):
    """
    Get questions for a specific role and level
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
            return {"error": "Role not found"}
        
        # Filter by level if specified
        if level:
            filtered_questions = [
                q for q in role_questions["questions"] 
                if q.get("level") == level or q.get("level") == "all"
            ]
        else:
            filtered_questions = role_questions["questions"]
        
        return {
            "role": role_questions["title"],
            "role_id": role_questions["id"],
            "level": level,
            "questions": filtered_questions
        }
    
    except Exception as e:
        return {"error": f"Failed to load questions: {str(e)}"}

@app.get("/api/roles")
async def get_all_roles():
    """
    Get all available roles
    """
    try:
        questions_data = load_questions()
        roles = []
        
        for role in questions_data["roles"]:
            roles.append({
                "id": role["id"],
                "title": role["title"],
                "description": role.get("description", ""),
                "tags": role.get("tags", [])
            })
        
        return {"roles": roles}
    
    except Exception as e:
        return {"error": f"Failed to load roles: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

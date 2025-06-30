import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.utils.faq_loader import load_all_faqs
from app.services.chroma_service import add_faqs_to_chroma, query_chroma
from app.services.groq_llm import ask_groq_llm

# Load environment variables (for GROQ_API_KEY)
load_dotenv()

app = FastAPI(title="IT Technical Support Chatbot API")

# Simple in-memory user database
users = {
    "alice": "password123",
    "bob": "mypassword"
}

# In-memory chat history per user
user_histories = {}

# Load FAQ at startup
faq_list = load_all_faqs('data')
add_faqs_to_chroma(faq_list)

class LoginRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    username: str
    message: str

class ChatResponse(BaseModel):
    response: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only! Use specific origins in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/login")
async def login(req: LoginRequest):
    if req.username in users and users[req.username] == req.password:
        return {"success": True, "username": req.username}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    # Save user history
    if req.username not in user_histories:
        user_histories[req.username] = []
    user_histories[req.username].append({"role": "user", "text": req.message})

    # Use ChromaDB to find the closest answer (context)
    context = query_chroma(req.message)
    if context:
        answer = ask_groq_llm(req.message, context)
        user_histories[req.username].append({"role": "bot", "text": answer})
        return {"response": answer}
    user_histories[req.username].append({"role": "bot", "text": "Sorry, I don't know the answer to that yet."})
    return {"response": "Sorry, I don't know the answer to that yet."}

@app.get("/history/{username}")
async def get_history(username: str):
    return user_histories.get(username, []) 
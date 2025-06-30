from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.utils.faq_loader import load_faq
from app.services.chroma_service import add_faqs_to_chroma, query_chroma

app = FastAPI(title="IT Technical Support Chatbot API")

# Load FAQ at startup
faq_list = load_faq('data/it_faq.txt')
add_faqs_to_chroma(faq_list)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only! Use specific origins in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    # Use ChromaDB to find the closest answer
    result = query_chroma(req.message)
    if result:
        return {"response": result}
    return {"response": "Sorry, I don't know the answer to that yet."} 
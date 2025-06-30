# IT Technical Support Chatbot (RAG-powered)

A production-ready, Retrieval-Augmented Generation (RAG) chatbot specialized in IT technical support. Built with FastAPI, LangChain, ChromaDB, Groq LLM, and a modern React frontend.

## Features
- RAG architecture with semantic and hybrid search
- Multi-format document ingestion (PDF, DOCX, TXT, HTML, Markdown)
- Real-time chat with context preservation
- User personalization and session management
- Multimodal support (text, images, documents)
- Source citation and confidence scoring
- Responsive, modern UI (React, CSS, shadcn/ui)

## Project Structure
```
chatbot-project/
├── backend/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── data/
└── README.md
```

## Getting Started

### Backend
1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Run FastAPI server:**
   ```bash
   uvicorn app.api.main:app --reload
   ```

### Frontend
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Run React dev server:**
   ```bash
   npm run dev
   ```

---

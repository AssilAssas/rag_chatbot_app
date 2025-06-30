import chromadb
from langchain.embeddings import HuggingFaceEmbeddings

# 1. Start ChromaDB (the smart search database)
chroma_client = chromadb.Client()

# 2. Create or get a collection (like a folder for your FAQ)
collection = chroma_client.get_or_create_collection("it_faq")

# 3. Set up an embedding model (turns text into numbers for searching)
embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def add_faqs_to_chroma(faq_list):
    # 4. For each FAQ, make an embedding and add it to ChromaDB
    for idx, faq in enumerate(faq_list):
        embedding = embedder.embed_query(faq['question'])
        collection.add(
            ids=[str(idx)],
            embeddings=[embedding],
            documents=[faq['answer']],  # Only the answer!
            metadatas=[{"question": faq['question']}]
        )

def query_chroma(question, top_k=1, min_score=0.7):
    embedding = embedder.embed_query(question)
    results = collection.query(query_embeddings=[embedding], n_results=top_k, include=["distances", "documents"])
    if results['documents'] and results['distances']:
        score = 1 - results['distances'][0][0]  # 1 - distance = similarity
        if score >= min_score:
            return results['documents'][0][0]
    return None 
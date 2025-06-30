from langchain.embeddings import HuggingFaceEmbeddings
import chromadb

# Start ChromaDB
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection("it_faq")
embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def add_faqs_to_chroma(faq_list):
    for idx, faq in enumerate(faq_list):
        embedding = embedder.embed_query(faq['question'])
        collection.add(
            ids=[str(idx)],
            embeddings=[embedding],
            documents=[faq['answer']],
            metadatas=[{"question": faq['question']}]
        )

def query_chroma(question, top_k=1, min_score=0.7):
    embedding = embedder.embed_query(question)
    results = collection.query(query_embeddings=[embedding], n_results=top_k, include=["distances", "documents"])
    if results['documents'] and results['distances']:
        score = 1 - results['distances'][0][0]
        if score >= min_score:
            return results['documents'][0][0]
    return None
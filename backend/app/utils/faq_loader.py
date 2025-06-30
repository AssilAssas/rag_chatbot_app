from docx import Document
from PyPDF2 import PdfReader
import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from docx.opc.exceptions import PackageNotFoundError
from PyPDF2.errors import PdfReadError

def parse_faq_text(text):
    faqs = []
    lines = text.split('\n')
    question, answer = None, None
    for line in lines:
        if line.startswith('Q:'):
            question = line[2:].strip()
        elif line.startswith('A:'):
            answer = line[2:].strip()
            if question and answer:
                faqs.append({'question': question, 'answer': answer})
                question, answer = None, None
    return faqs

def load_txt_faq(filepath):
    with open(filepath, encoding='utf-8') as f:
        text = f.read()
    return parse_faq_text(text)

def load_docx_faq(filepath):
    try:
        doc = Document(filepath)
    except (PackageNotFoundError, Exception) as e:
        print(f"Warning: Could not load DOCX file '{filepath}': {e}")
        return []
    text = "\n".join([para.text for para in doc.paragraphs])
    return parse_faq_text(text)

def load_pdf_faq(filepath):
    text = ""
    try:
        with open(filepath, "rb") as f:
            reader = PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except (PdfReadError, Exception) as e:
        print(f"Warning: Could not load PDF file '{filepath}': {e}")
        return []
    return parse_faq_text(text)

def load_all_faqs(data_dir):
    faqs = []
    for filename in os.listdir(data_dir):
        file_path = os.path.join(data_dir, filename)
        if filename.endswith('.txt'):
            faqs.extend(load_txt_faq(file_path))
        elif filename.endswith('.docx'):
            faqs.extend(load_docx_faq(file_path))
        elif filename.endswith('.pdf'):
            faqs.extend(load_pdf_faq(file_path))
    return faqs 
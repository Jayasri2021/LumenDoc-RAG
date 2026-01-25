import uuid
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from app.core.config import UPLOAD_DIR
import os


def generate_document_id() -> str:
    """Generate a unique document ID."""
    return f"doc_{uuid.uuid4().hex[:10]}"


def ingest_pdf(file_path: str):
    """Ingest a PDF file and return its document ID."""
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    extracted_text = [
        doc.page_content.strip()
        for doc in documents
        if doc.page_content and doc.page_content.strip()
    ]

    if not extracted_text:
        raise ValueError("No text found in the PDF document.")
    
    return documents


def ingest_url(url: str):
    loader = WebBaseLoader(url)
    documents = loader.load()

    extracted_text = [
        doc.page_content.strip()
        for doc in documents
        if doc.page_content and doc.page_content.strip()
    ]

    if not extracted_text:
        raise ValueError("No text found at the provided URL.")  
    
    return documents
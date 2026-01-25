import os
from typing import List
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from app.services.embedding_service import get_embedding_model

FAISS_INDEX_DIR = "faiss_indexes"
os.makedirs(FAISS_INDEX_DIR, exist_ok=True)


def get_faiss_index_path(document_id: str) -> str:
    return os.path.join(FAISS_INDEX_DIR, document_id)


def create_faiss_index(
    chunks: List[Document],
    document_id: str
) -> FAISS:
    """
    Create and persist FAISS index from document chunks
    """
    embeddings = get_embedding_model()

    vectorstore = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    vectorstore.save_local(get_faiss_index_path(document_id))
    return vectorstore


def load_faiss_index(document_id: str) -> FAISS:
    """
    Load FAISS index from disk
    """
    embeddings = get_embedding_model()
    index_path = get_faiss_index_path(document_id)

    if not os.path.exists(index_path):
        raise FileNotFoundError("FAISS index not found")

    return FAISS.load_local(index_path, embeddings)
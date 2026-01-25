from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ingestion_service import (
    ingest_pdf,
    ingest_url,
    generate_document_id
)
from app.services.chunking_service import chunk_documents
from app.vectorstores.faiss_store import create_faiss_index
from app.models.schemas import DocumentUploadResponse, URLIngestRequest
from app.core.config import UPLOAD_DIR
import shutil
import os

router = APIRouter(prefix='/documents', tags=['Documents'])

@router.post('/upload', response_model = DocumentUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    document_id = generate_document_id()
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}.pdf")

    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        documents = ingest_pdf(file_path)
        chunks = chunk_documents(
            documents=documents,
            chunk_size=1000,
            chunk_overlap=200,
            source="pdf",
            document_id=document_id)
        
        create_faiss_index(
            chunks=chunks,
            document_id=document_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return DocumentUploadResponse(
        document_id=document_id,
        source_type='pdf',
        pages_extracted=len(documents),
        message=f"PDF ingested and split into {len(chunks)} chunks"
    )

@router.post('/ingest-url', response_model = DocumentUploadResponse)
async def ingest_from_url(payload: URLIngestRequest):
    document_id = generate_document_id()

    try:
        documents = ingest_url(payload.url)

        chunks = chunk_documents(
            documents=documents,
            chunk_size=1000,
            chunk_overlap=200,
            source="url",
            document_id=document_id
        )
        create_faiss_index(
            chunks=chunks,
            document_id=document_id
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return DocumentUploadResponse(
        document_id=document_id,
        source_type='url',
        pages_extracted=len(documents),
        message=f"URL content ingested and split into {len(chunks)} chunks."
    )
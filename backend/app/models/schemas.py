from pydantic import BaseModel
from typing import List, Optional

class DocumentUploadResponse(BaseModel):
    document_id: str
    source_type: str
    pages_extracted: int
    message: str

class URLIngestRequest(BaseModel):
    url: str


class QueryRequest(BaseModel):
    document_id:str
    question: str
    top_k: Optional[int] = 5


class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
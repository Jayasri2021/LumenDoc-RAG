from pydantic import BaseModel
from typing import Optional

class DocumentUploadResponse(BaseModel):
    document_id: str
    source_type: str
    pages_extracted: int
    message: str


class URLIngestRequest(BaseModel):
    url: str
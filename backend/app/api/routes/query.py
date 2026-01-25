from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest, QueryResponse
from app.services.retrieval_service import query_document

router = APIRouter(prefix='/query', tags=['Query'])


@router.post('/', response_model=QueryResponse)
def query_rag(payload: QueryRequest):
    try:
        result = query_document(
            document_id=payload.document_id,
            question=payload.question,
            top_k=payload.top_k
        )
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document index not found.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query Failed: {repr(e)}")
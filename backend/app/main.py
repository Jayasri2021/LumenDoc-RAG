# test file for backend/app/main.py
from fastapi import FastAPI
from app.api.routes import documents

app = FastAPI(
    title = 'Rag Document Ingestion Service')

app.include_router(documents.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "OK"}
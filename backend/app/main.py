from dotenv import load_dotenv
from fastapi import FastAPI
from app.api.routes import documents, query

load_dotenv()

app = FastAPI(
    title = 'Rag Document Ingestion Service')

app.include_router(documents.router)
app.include_router(query.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "OK"}
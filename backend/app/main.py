from dotenv import load_dotenv
from fastapi import FastAPI
from app.api.routes import documents, query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(
    title = 'Rag Document Ingestion Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(documents.router)
app.include_router(query.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "OK"}
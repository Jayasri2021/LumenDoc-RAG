from langchain_openai import ChatOpenAI
from app.core.config import OPENAI_API_KEY

def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        openai_api_key=OPENAI_API_KEY
    )
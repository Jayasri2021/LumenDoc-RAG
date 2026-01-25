from langchain_openai import OpenAIEmbeddings
from app.core.config import OPENAI_API_KEY

def get_embedding_model():
    """Get OpenAI embedding model instance."""
    try:
        return OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=OPENAI_API_KEY
        )
    except Exception as e:
        raise RuntimeError(f"Failed to initialize embedding model: {str(e)}")
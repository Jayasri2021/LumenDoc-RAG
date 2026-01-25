from typing import List
from langchain_core.documents import Document
from app.vectorstores.faiss_store import load_faiss_index
from app.services.llm_service import get_llm


def build_prompt(context_chunks: List[Document], question: str) -> str:
    context_text = "\n\n".join(
        f"[Page {chunk.metadata.get('page', 'N/A')}]\n{chunk.page_content}"
        for chunk in context_chunks
    )

    prompt = f"""
You are an assistant that answers questions strictly using the provided context.
If the answer is not present in the context, say "I don't know."

Context:
{context_text}

Question:
{question}

Answer:
"""
    return prompt.strip()


def query_document(
    document_id: str,
    question: str,
    top_k: int = 5
):
    # 1. Load FAISS index
    vectorstore = load_faiss_index(document_id)

    # 2. Similarity search
    retrieved_chunks = vectorstore.similarity_search(
        query=question,
        k=top_k
    )

    if not retrieved_chunks:
        return {
            "answer": "I don't know.",
            "sources": []
        }

    # 3. Build prompt
    prompt = build_prompt(retrieved_chunks, question)

    # 4. Call LLM
    llm = get_llm()
    response = llm.invoke(prompt)

    # 5. Extract sources
    sources = [
        {
            "page": chunk.metadata.get("page"),
            "chunk_index": chunk.metadata.get("chunk_index"),
            "source": chunk.metadata.get("source")
        }
        for chunk in retrieved_chunks
    ]

    # Extract answer from response
    if hasattr(response, 'content'):
        answer = response.content
    else:
        answer = str(response)
    
    return {
        "answer": answer,
        "sources": sources
    }

from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document


def chunk_documents(
        documents: List[Document],
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        source: str = "unknown",
        document_id: str =""
) -> List[Document]:
    """ 
    Document chnking service that splits documents into smaller chunks.
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    chunks = splitter.split_documents(documents)

    # attach metadata to each chunk
    for idx, chunk in enumerate(chunks):
        chunk.metadata.update({
            "chunk_index": idx,
            "source": source,
            "document_id": document_id,
            "page": chunk.metadata.get("page", None)
        })

    if not chunks:
        raise ValueError("Chunking failed: no chunks created")
    
    return chunks


def validate_chunks(chunks:List[Document], min_chunks: int = 1):
    if len(chunks) < min_chunks:
        raise ValueError("Insufficient chunks created")
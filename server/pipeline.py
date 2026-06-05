import os
import sqlite3
import struct
import pymupdf4llm
from sentence_transformers import SentenceTransformer

# Re-use settings from existing codebase where possible


RAW_PDF_DIR = "../data/raw_pdfs/"
MD_OUTPUT_DIR = "../data/processed_markdown/"
CHUNK_SIZE = 400
CHUNK_OVERLAP = 50

def get_chunks(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into word-based chunks with overlap."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks

def process_uploaded_pdf(filename: str):
    """
    Background task to process a PDF:
    1. Extract to Markdown
    2. Chunk the text
    3. Embed and insert into SQLite vector DB
    4. Update the sources table status to 'ready'
    """
    from server.main import get_db, serialize_f32, embed_model
    pdf_path = os.path.join(RAW_PDF_DIR, filename)
    md_filename = filename.replace(".pdf", ".md")
    md_path = os.path.join(MD_OUTPUT_DIR, md_filename)
    
    # Ensure dirs exist
    os.makedirs(RAW_PDF_DIR, exist_ok=True)
    os.makedirs(MD_OUTPUT_DIR, exist_ok=True)

    try:
        # 1. Extract PDF to Markdown
        print(f"[{filename}] Extracting PDF to Markdown...")
        md_text = pymupdf4llm.to_markdown(pdf_path)
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_text)

        # 2. Chunk text
        print(f"[{filename}] Chunking text...")
        chunks = get_chunks(md_text)
        if not chunks:
            raise ValueError("No text extracted from PDF")

        # 3. Embed chunks
        print(f"[{filename}] Embedding {len(chunks)} chunks...")
        embeddings = embed_model.encode(chunks, show_progress_bar=False, normalize_embeddings=True)

        # 4. Insert into database
        print(f"[{filename}] Inserting into database...")
        db = get_db()
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            cursor = db.execute(
                "INSERT INTO chunks (source, chunk_id, content) VALUES (?, ?, ?)",
                (md_filename, i, chunk),
            )
            row_id = cursor.lastrowid
            
            db.execute(
                "INSERT INTO vec_chunks (rowid, embedding) VALUES (?, ?)",
                (row_id, serialize_f32(emb.tolist())),
            )
        
        # 5. Update source status
        db.execute(
            "UPDATE sources SET status = 'ready' WHERE filename = ?",
            (filename,)
        )
        db.commit()
        db.close()
        
        print(f"[{filename}] Successfully processed and indexed.")
        
    except Exception as e:
        print(f"[{filename}] Error processing PDF: {e}")
        try:
            db = get_db()
            db.execute(
                "UPDATE sources SET status = 'error' WHERE filename = ?",
                (filename,)
            )
            db.commit()
            db.close()
        except:
            pass

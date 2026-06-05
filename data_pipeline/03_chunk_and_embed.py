"""
03_chunk_and_embed.py — SQLite + sqlite-vec Pipeline

Reads Markdown files, chunks them, embeds with all-MiniLM-L6-v2,
and stores everything in a single SQLite database with a vec0 virtual table
for fast cosine-similarity search.

Output: ../data/vector_db/embeddings.db
"""

import os
import sqlite3
import struct
from sentence_transformers import SentenceTransformer

# ── Paths ──────────────────────────────────────────────
MD_DIR  = "../data/processed_markdown/"
DB_DIR  = "../data/vector_db/"
DB_PATH = os.path.join(DB_DIR, "embeddings.db")

# ── Embedding model (384-dim) ──────────────────────────
EMBED_MODEL = "all-MiniLM-L6-v2"
EMBED_DIM   = 384

# ── Chunking parameters ────────────────────────────────
CHUNK_SIZE  = 400   # words per chunk
CHUNK_OVERLAP = 50  # overlap in words


def serialize_f32(vec: list[float]) -> bytes:
    """Pack a list of floats into a compact little-endian binary blob."""
    return struct.pack(f"<{len(vec)}f", *vec)


def get_chunks(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into word-based chunks with overlap."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks


def create_tables(db: sqlite3.Connection):
    """Create the chunks metadata table and the vec0 virtual table."""

    # Regular table: stores the text & metadata
    db.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            source  TEXT    NOT NULL,
            chunk_id INTEGER NOT NULL,
            content TEXT    NOT NULL
        )
    """)

    # Virtual table: stores the embedding vectors for cosine search
    db.execute(f"""
        CREATE VIRTUAL TABLE IF NOT EXISTS vec_chunks USING vec0(
            embedding float[{EMBED_DIM}] distance_metric=cosine
        )
    """)

    db.commit()


def embed_and_store():
    print(f"Loading embedding model: {EMBED_MODEL}...")
    model = SentenceTransformer(EMBED_MODEL)

    os.makedirs(DB_DIR, exist_ok=True)

    # ── Connect & load sqlite-vec extension ───────────
    db = sqlite3.connect(DB_PATH)
    db.enable_load_extension(True)

    import sqlite_vec
    sqlite_vec.load(db)

    db.enable_load_extension(False)

    # ── Create tables ──────────────────────────────────
    create_tables(db)

    # ── Process each Markdown file ─────────────────────
    md_files = sorted(f for f in os.listdir(MD_DIR) if f.endswith(".md"))

    if not md_files:
        print(f"No .md files found in {MD_DIR}")
        return

    total_chunks = 0

    for filename in md_files:
        filepath = os.path.join(MD_DIR, filename)
        print(f"\nChunking: {filename}...")

        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()

        chunks = get_chunks(text)
        if not chunks:
            print(f"  ⚠ No chunks produced, skipping.")
            continue

        # Batch-embed all chunks for this file
        print(f"  Embedding {len(chunks)} chunks...")
        embeddings = model.encode(chunks, show_progress_bar=True, normalize_embeddings=True)

        # Insert into both tables in a single transaction
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            # Insert text + metadata → get the rowid
            cursor = db.execute(
                "INSERT INTO chunks (source, chunk_id, content) VALUES (?, ?, ?)",
                (filename, i, chunk),
            )
            row_id = cursor.lastrowid

            # Insert embedding into vec0 with the same rowid
            db.execute(
                "INSERT INTO vec_chunks (rowid, embedding) VALUES (?, ?)",
                (row_id, serialize_f32(emb.tolist())),
            )

        db.commit()
        total_chunks += len(chunks)
        print(f"  ✓ Stored {len(chunks)} chunks from {filename}")

    # ── Summary ────────────────────────────────────────
    db.close()
    db_size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"\n{'='*50}")
    print(f"Database ready: {DB_PATH}")
    print(f"Total chunks:   {total_chunks}")
    print(f"Database size:  {db_size_mb:.1f} MB")
    print(f"{'='*50}")


if __name__ == "__main__":
    embed_and_store()
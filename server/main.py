"""
EdTech Offline AI Server — SQLite + sqlite-vec backend

Features:
  - Vector search via sqlite-vec (cosine similarity)
  - Configurable LLM model, top_k, threshold via .env
  - Admin API: GET/PUT /settings, GET /models
"""

import os
import sqlite3
import struct
import shutil
import sys
from pathlib import Path

# Ensure the root directory is in sys.path so 'server' is resolvable
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv, set_key, dotenv_values
import sqlite_vec
import ollama

from server.pipeline import process_uploaded_pdf, RAW_PDF_DIR, MD_OUTPUT_DIR

# ── Paths ──────────────────────────────────────────────
SERVER_DIR = Path(__file__).parent
ENV_PATH = SERVER_DIR / ".env"
DB_PATH = SERVER_DIR / ".." / "data" / "vector_db" / "embeddings.db"
EMBED_MODEL = "all-MiniLM-L6-v2"

# ── Load .env ──────────────────────────────────────────
load_dotenv(ENV_PATH)


def get_settings() -> dict:
    """Read current settings from .env file."""
    raw = dotenv_values(ENV_PATH)
    return {
        "llm_model": raw.get("LLM_MODEL", "deepseek-r1:1.5b"),
        "llm_model_multilingual": raw.get("LLM_MODEL_MULTILINGUAL", "llama3.1:8b"),
        "top_k": int(raw.get("TOP_K", "3")),
        "relevance_threshold": float(raw.get("RELEVANCE_THRESHOLD", "0.45")),
        "temperature": float(raw.get("TEMPERATURE", "0.6")),
    }


def save_settings(settings: dict):
    """Write settings back to .env file."""
    key_map = {
        "llm_model": "LLM_MODEL",
        "llm_model_multilingual": "LLM_MODEL_MULTILINGUAL",
        "top_k": "TOP_K",
        "relevance_threshold": "RELEVANCE_THRESHOLD",
        "temperature": "TEMPERATURE",
    }
    for key, env_key in key_map.items():
        if key in settings:
            set_key(str(ENV_PATH), env_key, str(settings[key]))


# ── Initialize FastAPI ─────────────────────────────────
app = FastAPI(title="EdTech Offline AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load the embedding model once at startup ──────────
print(f"Loading embedding model: {EMBED_MODEL}...")
embed_model = SentenceTransformer(EMBED_MODEL)
print("Embedding model loaded.")

# ── Connect to SQLite + sqlite-vec ────────────────────
print(f"Connecting to database: {DB_PATH}")


def get_db() -> sqlite3.Connection:
    """Create a new connection with sqlite-vec loaded."""
    db = sqlite3.connect(str(DB_PATH))
    db.enable_load_extension(True)
    sqlite_vec.load(db)
    db.enable_load_extension(False)
    return db


# Verify database exists and has data
try:
    _db = get_db()
    count = _db.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
    
    # Create sources table and sync existing chunks
    _db.execute("""
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL DEFAULT 'ready',
            is_active INTEGER NOT NULL DEFAULT 1
        )
    """)
    _db.execute("""
        INSERT OR IGNORE INTO sources (filename, status, is_active)
        SELECT DISTINCT REPLACE(source, '.md', '.pdf'), 'ready', 1 FROM chunks
    """)
    
    # Create roadmaps table for AI-generated learning paths
    _db.execute("""
        CREATE TABLE IF NOT EXISTS roadmaps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal TEXT NOT NULL,
            source_filename TEXT NOT NULL,
            data TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ready'
        )
    """)
    
    # Migrate existing databases
    try:
        _db.execute("ALTER TABLE roadmaps ADD COLUMN status TEXT NOT NULL DEFAULT 'ready'")
    except sqlite3.OperationalError:
        pass # Column already exists
        
    _db.commit()
    
    _db.close()
    print(f"Database connected — {count} chunks indexed.")
except Exception as e:
    print(f"⚠ Database error: {e}")
    print("  Did you run data_pipeline/03_chunk_and_embed.py first?")


def serialize_f32(vec: list[float]) -> bytes:
    """Pack a list of floats into a compact binary blob for sqlite-vec."""
    return struct.pack(f"<{len(vec)}f", *vec)


# ── Language config ────────────────────────────────────
LANG_INSTRUCTIONS = {
    "uz": "Your FINAL visible answer (outside <think> tags) MUST ALWAYS be written in simple, easy-to-understand Uzbek. Use short sentences. Use everyday analogies a 5-year-old would understand. This rule has NO exceptions.",
    "en": "Your FINAL visible answer (outside <think> tags) MUST ALWAYS be written in simple, easy-to-understand English. Use short sentences. Use everyday analogies a 5-year-old would understand. This rule has NO exceptions.",
    "ru": "Your FINAL visible answer (outside <think> tags) MUST ALWAYS be written in simple, easy-to-understand Russian. Use short sentences. Use everyday analogies a 5-year-old would understand. This rule has NO exceptions.",
}


# ══════════════════════════════════════════════════════
#  ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════

class SettingsUpdate(BaseModel):
    llm_model: str | None = None
    llm_model_multilingual: str | None = None
    top_k: int | None = None
    relevance_threshold: float | None = None
    temperature: float | None = None


@app.get("/settings")
def read_settings():
    """Return the current server settings."""
    return get_settings()


@app.put("/settings")
def update_settings(update: SettingsUpdate):
    """Update server settings and persist to .env file."""
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No settings provided")

    # Validate
    if "top_k" in changes and not (1 <= changes["top_k"] <= 10):
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 10")
    if "relevance_threshold" in changes and not (0.0 < changes["relevance_threshold"] < 1.0):
        raise HTTPException(status_code=400, detail="relevance_threshold must be between 0.0 and 1.0")
    if "temperature" in changes and not (0.0 <= changes["temperature"] <= 2.0):
        raise HTTPException(status_code=400, detail="temperature must be between 0.0 and 2.0")

    save_settings(changes)
    return {"status": "ok", "updated": changes, "current": get_settings()}


@app.get("/models")
def list_models():
    """List all locally available Ollama models."""
    try:
        result = ollama.list()
        models = [m.model for m in result.models]
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not list Ollama models: {e}")


# ══════════════════════════════════════════════════════
#  SOURCES ENDPOINTS
# ══════════════════════════════════════════════════════

@app.get("/sources")
def list_sources():
    db = get_db()
    rows = db.execute("SELECT filename, status, is_active FROM sources").fetchall()
    db.close()
    return [{"filename": r[0], "status": r[1], "is_active": bool(r[2])} for r in rows]

@app.post("/sources/upload")
async def upload_source(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    os.makedirs(RAW_PDF_DIR, exist_ok=True)
    file_path = os.path.join(RAW_PDF_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db = get_db()
    try:
        db.execute(
            "INSERT OR REPLACE INTO sources (filename, status, is_active) VALUES (?, ?, ?)",
            (file.filename, "processing", 1)
        )
        db.commit()
    except sqlite3.Error as e:
        db.close()
        raise HTTPException(status_code=500, detail=str(e))
    db.close()
    
    background_tasks.add_task(process_uploaded_pdf, file.filename)
    return {"status": "ok", "message": "File uploaded and processing started"}

@app.put("/sources/{filename}/toggle")
def toggle_source(filename: str):
    db = get_db()
    row = db.execute("SELECT is_active FROM sources WHERE filename = ?", (filename,)).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Source not found")
        
    new_status = 0 if row[0] == 1 else 1
    db.execute("UPDATE sources SET is_active = ? WHERE filename = ?", (new_status, filename))
    db.commit()
    db.close()
    return {"status": "ok", "is_active": bool(new_status)}

@app.delete("/sources/{filename}")
def delete_source(filename: str):
    db = get_db()
    db.execute("DELETE FROM sources WHERE filename = ?", (filename,))
    md_filename = filename.replace('.pdf', '.md')
    db.execute(
        "DELETE FROM vec_chunks WHERE rowid IN (SELECT id FROM chunks WHERE source = ?)",
        (md_filename,)
    )
    db.execute("DELETE FROM chunks WHERE source = ?", (md_filename,))
    db.commit()
    db.close()
    pdf_path = os.path.join(RAW_PDF_DIR, filename)
    md_path = os.path.join(MD_OUTPUT_DIR, md_filename)
    if os.path.exists(pdf_path): os.remove(pdf_path)
    if os.path.exists(md_path): os.remove(md_path)
    return {"status": "ok"}


# ══════════════════════════════════════════════════════
#  ROADMAP ENDPOINTS
# ══════════════════════════════════════════════════════
import json
import re

class RoadmapGenerateRequest(BaseModel):
    goal: str
    source_filename: str
    language: str = "en"

class RoadmapUpdateRequest(BaseModel):
    data: str

@app.get("/roadmaps")
def list_roadmaps():
    db = get_db()
    rows = db.execute("SELECT id, goal, source_filename, data, status FROM roadmaps ORDER BY id DESC").fetchall()
    db.close()
    return [{"id": r[0], "goal": r[1], "source_filename": r[2], "data": json.loads(r[3]), "status": r[4]} for r in rows]


def _find_list(obj):
    if isinstance(obj, list):
        return obj
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, list) and len(v) > 0:
                return v
            if isinstance(v, dict):
                r = _find_list(v)
                if r:
                    return r
    return None

def _norm_keywords(v):
    if not isinstance(v, list):
        return []
    res = []
    for x in v:
        if isinstance(x, dict):
            res.append({"term": str(x.get("term", x.get("keyword", ""))), "description": str(x.get("description", x.get("definition", "")))})
        elif isinstance(x, str):
            res.append({"term": x, "description": ""})
    return [r for r in res if r["term"]]

def _norm_questions(v):
    if not isinstance(v, list):
        return []
    res = []
    for x in v:
        if isinstance(x, dict):
            res.append({"question": str(x.get("question", "")), "answer": str(x.get("answer", ""))})
    return [r for r in res if r["question"]]

def _norm_task(t, idx, mi):
    if not isinstance(t, dict):
        return {"id": f"m{mi}t{idx}", "type": "read", "title": str(t), "content": str(t), "completed": False}
    ttype = t.get("type", "read")
    task = {
        "id": t.get("id", f"m{mi}t{idx}"),
        "type": ttype,
        "title": t.get("title", t.get("name", f"Task {idx}")),
        "completed": bool(t.get("completed", False)),
    }
    if "content" in t or "explanation" in t or "description" in t:
        task["content"] = t.get("content", t.get("explanation", t.get("description", "")))
    if "question" in t:
        task["type"] = "quiz"
        task["question"] = t.get("question", "")
        task["answer"] = t.get("answer", "See textbook.")
    if task["type"] == "quiz" and "question" not in task:
        task["question"] = task["title"]
        task["answer"] = t.get("answer", "See textbook.")
    return task


def generate_roadmap_task(roadmap_id: int, goal: str, source_filename: str, language: str, llm_model: str):
    db = get_db()
    md_source = source_filename.replace('.pdf', '.md')

    # ══════════════════════════════════════════════════════
    #  PHASE 1: GENERATE OUTLINE
    # ══════════════════════════════════════════════════════
    query_vec = embed_model.encode(goal).tolist()
    vec_blob = serialize_f32(query_vec)
    try:
        rows = db.execute("""
            SELECT c.content, c.source 
            FROM (
                SELECT rowid, distance 
                FROM vec_chunks 
                WHERE embedding MATCH ? AND k = 50
            ) v
            INNER JOIN chunks c ON v.rowid = c.id
            ORDER BY v.distance
        """, (vec_blob,)).fetchall()
        source_chunks = [r for r in rows if r[1] == md_source][:20]
        if not source_chunks: source_chunks = rows[:20]
        context_text = "\n\n---\n\n".join([r[0] for r in source_chunks])
    except Exception as e:
        print(f"[roadmap] DB error: {e}")
        db.execute("UPDATE roadmaps SET status = 'error' WHERE id = ?", (roadmap_id,))
        db.commit()
        db.close()
        return

    if not context_text.strip():
        print("[roadmap] No relevant content found.")
        db.execute("UPDATE roadmaps SET status = 'error' WHERE id = ?", (roadmap_id,))
        db.commit()
        db.close()
        return

    outline_prompt = f"""You are an expert curriculum designer. Create a learning roadmap outline based on the textbook content provided.

CRITICAL: Generate EXACTLY 4 to 6 modules.

Return valid JSON matching this structure:
{{
  "title": "Descriptive Roadmap Title",
  "modules": [
    {{
      "id": "m1",
      "title": "Module 1: Topic Name",
      "explanation": "2-3 sentences explaining what this module covers."
    }}
  ]
}}
Write in {language}."""

    outline_data = None
    for attempt in range(3):
        try:
            print(f"[roadmap] Phase 1 (Outline) attempt {attempt+1}")
            res = ollama.chat(
                model=llm_model,
                messages=[
                    {"role": "system", "content": outline_prompt},
                    {"role": "user", "content": f"TEXTBOOK CONTENT:\n{context_text}\n\nGOAL: {goal}\n\nGenerate the outline JSON."}
                ],
                format="json",
                options={"temperature": 0.4 + (attempt * 0.2), "num_ctx": 4096}
            )
            raw = res.message.content
            cleaned = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
            if not cleaned: raise ValueError("Empty response")
            outline_data = json.loads(cleaned)
            if not outline_data.get("modules"): raise ValueError("No modules found")
            break
        except Exception as e:
            print(f"[roadmap] Outline error: {e}")
            if attempt == 2:
                outline_data = {
                    "title": goal,
                    "modules": [
                        {"id": "m1", "title": "Module 1: Introduction to " + goal, "explanation": "Core concepts."},
                        {"id": "m2", "title": "Module 2: Advanced " + goal, "explanation": "Deeper exploration."}
                    ]
                }

    roadmap_json = {"title": outline_data.get("title", goal), "modules": []}
    for i, m in enumerate(outline_data.get("modules", [])):
        roadmap_json["modules"].append({
            "id": f"m{i+1}",
            "title": m.get("title", f"Module {i+1}"),
            "explanation": m.get("explanation", ""),
            "keywords": [],
            "questions": [],
            "tasks": []
        })

    # Save Phase 1 progress to DB
    db.execute("UPDATE roadmaps SET data = ? WHERE id = ?", (json.dumps(roadmap_json), roadmap_id))
    db.commit()

    # ══════════════════════════════════════════════════════
    #  PHASE 2 & 3: GENERATE CONTENT THEN TASKS
    # ══════════════════════════════════════════════════════
    for mi, mod in enumerate(roadmap_json["modules"]):
        mod_query = f"{goal} {mod['title']}"
        mod_vec = embed_model.encode(mod_query).tolist()
        mod_blob = serialize_f32(mod_vec)
        
        mod_rows = db.execute("""
            SELECT c.content, c.source 
            FROM (
                SELECT rowid, distance 
                FROM vec_chunks 
                WHERE embedding MATCH ? AND k = 100
            ) v
            INNER JOIN chunks c ON v.rowid = c.id
            ORDER BY v.distance
        """, (mod_blob,)).fetchall()
        mod_chunks = [r for r in mod_rows if r[1] == md_source][:30]
        if not mod_chunks: mod_chunks = mod_rows[:30]
        mod_context = "\n\n---\n\n".join([r[0] for r in mod_chunks])

        # --- Phase 2: Content Generation ---
        content_prompt = f"""You are an expert textbook author. Write a comprehensive, detailed, and highly organized textbook chapter for the module "{mod['title']}".
CRITICAL INSTRUCTIONS: 
1. Copy extensively from the textbook context to create rich, deep, educational content.
2. Structure the chapter beautifully with Markdown headings (##, ###), bullet points, and bold text.
3. Make it long and exhaustive.
4. Do NOT include Quizzes or Tasks. Just write the textbook chapter content.
5. If you include any mathematical equations or formulas, you MUST wrap inline math in $...$ and block math in $$...$$. Do NOT use raw parentheses ( ) or brackets [ ] for math.
6. Write in {language}."""

        chapter_content = ""
        for attempt in range(2):
            try:
                print(f"[roadmap] Phase 2 (Content) for '{mod['title']}' attempt {attempt+1}")
                res = ollama.chat(
                    model=llm_model,
                    messages=[
                        {"role": "system", "content": content_prompt},
                        {"role": "user", "content": f"TEXTBOOK CONTEXT:\n{mod_context}\n\nGenerate the comprehensive Markdown chapter."}
                    ],
                    options={"temperature": 0.3 + (attempt * 0.2), "num_ctx": 8192}
                )
                raw = res.message.content
                chapter_content = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
                if not chapter_content: raise ValueError("Empty content response")
                break
            except Exception as e:
                print(f"[roadmap] Content error: {e}")
                chapter_content = f"Error generating content: {e}. Please refer to the textbook for {mod['title']}."

        mod["chapter_content"] = chapter_content
        
        keywords = []
        questions = []
        tasks = []

        # Convert the chapter content into Jupyter-style collapsible reading tasks
        sections_raw = re.split(r'(?m)^(?=#{1,3}\s+)', chapter_content)
        for sec in sections_raw:
            sec = sec.strip()
            if not sec: continue
            
            lines = sec.split('\n', 1)
            raw_title = lines[0].strip()
            clean_title = re.sub(r'^#+\s+', '', raw_title)
            
            # Use the entire section (including its header) as the content so formatting is preserved
            tasks.append({
                "id": f"m{mi+1}t{len(tasks)+1}", "type": "read_section", "title": clean_title, 
                "content": sec, "completed": False
            })
            
        # Absolute fallback if splitting fails
        if not tasks:
            tasks.append({
                "id": f"m{mi+1}t1", "type": "read_section", "title": "Module Content", 
                "content": chapter_content, "completed": False
            })

        # --- Phase 3: Task Generation ---
        task_prompt = f"""You are an expert tutor. Based ONLY on the provided textbook chapter, generate interactive Tasks and Quizzes for the student.

CRITICAL INSTRUCTIONS:
1. Extract ALL important Keywords from the text and provide their definitions. Do not limit to 3.
2. Generate 3 to 5 Multiple-Choice Quiz Tasks to test understanding of the material.
3. The questions MUST be derived from the chapter text.

Output EXACTLY this Markdown format:

# Keywords
- **Keyword1**: Definition.
- **Keyword2**: Definition.
(Continue for ALL important keywords)

# Task 1: Quiz
Q: [Multiple Choice Question]
A) Option A
B) Option B
C) Option C
D) Option D
A: [Correct Option Letter, e.g., B]

(Continue for 3 to 5 Quiz Tasks)

Rules:
- Do NOT output JSON. Only output Markdown.
- Write in {language}."""

        for attempt in range(2):
            try:
                print(f"[roadmap] Phase 3 (Tasks) for '{mod['title']}' attempt {attempt+1}")
                res = ollama.chat(
                    model=llm_model,
                    messages=[
                        {"role": "system", "content": task_prompt},
                        {"role": "user", "content": f"CHAPTER TEXT:\n{chapter_content}\n\nGenerate the Tasks."}
                    ],
                    options={"temperature": 0.3 + (attempt * 0.2), "num_ctx": 8192}
                )
                raw = res.message.content
                cleaned = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
                if not cleaned: raise ValueError("Empty task response")
                
                # Markdown Parser for Tasks
                sections = re.split(r'(?m)^#\s+', cleaned)
                for sec in sections:
                    if not sec.strip(): continue
                    lines = sec.strip().split('\n')
                    title = lines[0].strip()
                    body = '\n'.join(lines[1:]).strip()
                    
                    title_lower = title.lower()
                    if 'keyword' in title_lower:
                        for line in body.split('\n'):
                            if line.strip().startswith('-'):
                                m = re.match(r'-\s*\*\*?(.*?)\*\*?:\s*(.*)', line.strip())
                                if m:
                                    keywords.append({"term": m.group(1).strip(), "description": m.group(2).strip()})
                                else:
                                    parts = line.strip()[1:].split(':', 1)
                                    if len(parts) == 2:
                                        keywords.append({"term": parts[0].replace('*', '').strip(), "description": parts[1].strip()})
                    elif 'task' in title_lower or 'quiz' in title_lower:
                        if 'quiz' in title_lower or re.search(r'(?m)^Q:\s*', body):
                            parts = re.split(r'(?m)^A:\s*', body, maxsplit=1)
                            if len(parts) == 2:
                                q_text = re.sub(r'(?m)^Q:\s*', '', parts[0]).strip()
                                a_text = parts[1].strip()
                                tasks.append({
                                    "id": f"m{mi+1}t{len(tasks)+1}", "type": "quiz", "title": title, 
                                    "question": q_text, "answer": a_text, "completed": False
                                })
                
                # If we parsed keywords or quizzes successfully, break
                if keywords or len(tasks) > 1: break
            except Exception as e:
                print(f"[roadmap] Task error: {e}")
                
        # Absolute fallback if Phase 3 completely failed
        if not tasks: 
            tasks.append({
                "id": f"m{mi+1}t1", "type": "read", "title": "Read Chapter", 
                "content": "Please read the chapter content generated above.", "completed": False
            })

        mod["keywords"] = keywords
        mod["questions"] = questions
        mod["tasks"] = tasks

        # Save Phase 2&3 loop progress to DB after each module
        db.execute("UPDATE roadmaps SET data = ? WHERE id = ?", (json.dumps(roadmap_json), roadmap_id))
        db.commit()

    # Done generating!
    db.execute("UPDATE roadmaps SET status = 'ready' WHERE id = ?", (roadmap_id,))
    db.commit()
    db.close()
    print(f"[roadmap] Generation complete for Roadmap ID: {roadmap_id}")


@app.post("/roadmap/generate")
def generate_roadmap(req: RoadmapGenerateRequest, background_tasks: BackgroundTasks):
    settings = get_settings()
    llm_model = settings["llm_model"]
    if req.language.lower() not in ["en", "english"]:
        llm_model = settings["llm_model_multilingual"]
        
    db = get_db()
    init_data = {"title": "Generating Learning Path...", "modules": []}
    cursor = db.execute(
        "INSERT INTO roadmaps (goal, source_filename, data, status) VALUES (?, ?, ?, ?)",
        (req.goal, req.source_filename, json.dumps(init_data), "generating")
    )
    roadmap_id = cursor.lastrowid
    db.commit()
    db.close()
    
    background_tasks.add_task(
        generate_roadmap_task,
        roadmap_id, req.goal, req.source_filename, req.language, llm_model
    )
    
    return {
        "id": roadmap_id, 
        "goal": req.goal, 
        "source_filename": req.source_filename, 
        "data": init_data, 
        "status": "generating"
    }

@app.put("/roadmaps/{roadmap_id}")
def update_roadmap(roadmap_id: int, req: RoadmapUpdateRequest):
    db = get_db()
    db.execute("UPDATE roadmaps SET data = ? WHERE id = ?", (req.data, roadmap_id))
    db.commit()
    db.close()
    return {"status": "ok"}

@app.delete("/roadmaps/{roadmap_id}")
def delete_roadmap(roadmap_id: int):
    db = get_db()
    db.execute("DELETE FROM roadmaps WHERE id = ?", (roadmap_id,))
    db.commit()
    db.close()
    return {"status": "ok"}


# ══════════════════════════════════════════════════════
#  FAST ROUTER — classify input before hitting the DB
# ══════════════════════════════════════════════════════

# Greeting / filler patterns (lowercase, checked as substrings or exact matches)
_GREETING_EXACT = {
    "hi", "hello", "hey", "yo", "salom", "assalomu alaykum",
    "привет", "здравствуйте", "салом",
    "ok", "okay", "thanks", "thank you", "rahmat", "tashakkur",
    "yes", "no", "ha", "yo'q", "да", "нет",
    "bye", "goodbye", "xayr", "ko'rishguncha",
}

_CASUAL_PHRASES = [
    "how are you", "what's up", "good morning", "good evening",
    "tell me more", "explain more", "go on", "continue",
    "i don't understand", "i didn't get it", "tushunmadim",
    "nima demoqchisiz", "what do you mean",
    "who are you", "what can you do", "help me",
    "kim siz", "nima qila olasiz",
    "кто ты", "что ты умеешь",
]

MAX_CASUAL_WORDS = 8  # inputs longer than this are likely real questions


def is_casual_chat(text: str) -> bool:
    """
    Lightweight heuristic to detect greetings, filler, and conversational input.
    Returns True → skip database, go direct to LLM.
    Returns False → perform full RAG search.
    """
    cleaned = text.strip().lower().rstrip("?!.,")
    words = cleaned.split()

    # Very short input → almost certainly casual
    if len(words) <= 2 and cleaned in _GREETING_EXACT:
        return True

    # Check exact matches (handles multi-word greetings)
    if cleaned in _GREETING_EXACT:
        return True

    # Check casual phrase patterns (short inputs only)
    if len(words) <= MAX_CASUAL_WORDS:
        for phrase in _CASUAL_PHRASES:
            if phrase in cleaned:
                return True

    return False


# ══════════════════════════════════════════════════════
#  CHAT ENDPOINT
# ══════════════════════════════════════════════════════

class QueryRequest(BaseModel):
    question: str
    language: str = "uz"
    explain_further: bool = False


@app.post("/ask")
def ask_question(request: QueryRequest):
    settings = get_settings()
    if request.language.lower() not in ["en", "english"]:
        settings["llm_model"] = settings["llm_model_multilingual"]
        
    lang_rule = LANG_INSTRUCTIONS.get(request.language, LANG_INSTRUCTIONS["uz"])

    try:
        # ┌─────────────────────────────────────────────┐
        # │  FAST ROUTER: casual chat vs. RAG question  │
        # └─────────────────────────────────────────────┘
        if request.explain_further:
            return _handle_explain_further(request, settings, lang_rule)
        elif is_casual_chat(request.question):
            return _handle_casual(request, settings, lang_rule)
        else:
            return _handle_rag(request, settings, lang_rule)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Path A: Direct LLM (no database) ──────────────────
def _handle_casual(request: QueryRequest, settings: dict, lang_rule: str) -> dict:
    """Handle greetings, small talk, and conversational filler."""

    system_prompt = f"""You are a friendly STEM tutor for young students. This is a casual conversation moment — the student is greeting you, making small talk, or asking a clarifying question.

RULES:
• Respond warmly and briefly (1–3 sentences max).
• If it's a greeting, say hello and ask what subject or topic they'd like to explore today.
• If they say "tell me more" or "explain more", ask them to specify what topic they want to learn about.
• Keep your <think> reasoning to ONE sentence — this is trivial.
• {lang_rule}

Do NOT reference any textbook or database. Just be a natural, friendly tutor."""

    response = ollama.chat(
        model=settings["llm_model"],
        options={"temperature": settings["temperature"]},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.question},
        ],
    )

    return {
        "question": request.question,
        "context_used": [],
        "answer": response["message"]["content"],
    }


# ── Path C: Explain Further (Broader Knowledge) ───────────
def _handle_explain_further(request: QueryRequest, settings: dict, lang_rule: str) -> dict:
    """Handle follow-up requests to expand on a topic using broad knowledge."""
    prompt = f"""You are an expert STEM tutor. The student previously asked: "{request.question}"
You already gave a simple, textbook-based answer. Now, the student wants you to EXPLAIN FURTHER.

YOUR MISSION:
Expand on the topic using your broad scientific knowledge. Provide deeper insights, interesting facts, real-world applications, or advanced analogies that weren't in the textbook.

RULES:
1. Always output your reasoning inside <think>...</think> tags first.
2. Keep it fascinating, but still easy to understand.
3. {lang_rule}
"""
    response = ollama.chat(
        model=settings["llm_model"],
        options={"temperature": settings["temperature"]},
        messages=[
            {"role": "system", "content": prompt},
        ],
    )
    
    reply = response["message"]["content"]
    
    thoughts = ""
    clean_reply = reply
    think_match = re.search(r"<think>(.*?)</think>", reply, re.IGNORECASE | re.DOTALL)
    if think_match:
        thoughts = f"<think>PHASE 1 (Broadening knowledge & explaining further):\n{think_match.group(1).strip()}</think>\n\n"
        clean_reply = re.sub(r"<think>.*?</think>", "", reply, flags=re.IGNORECASE | re.DOTALL).strip()

    combined_answer = f"{thoughts}{clean_reply}"

    return {
        "question": f"Explain further: {request.question}",
        "context_used": [],
        "answer": combined_answer,
    }


import re

# ── Path B: Agentic RAG pipeline (Thinking -> RAG -> Thinking) ────────
def _handle_rag(request: QueryRequest, settings: dict, lang_rule: str) -> dict:
    """Agentic RAG: Model thinks first, optionally searches, then answers."""

    # ════════════════════════════════════════════════════
    #  STEP 1: LLM THINKS AND GENERATES SEARCH QUERY
    # ════════════════════════════════════════════════════
    step1_prompt = f"""You are an expert STEM tutor. The student just asked a question.

YOUR MISSION:
1. Always output your reasoning inside <think>...</think> tags first.
2. Decide if you need specific textbook knowledge (formulas, physics definitions, specific STEM concepts) to answer accurately.
3. If you DO need textbook knowledge, output a search query in this exact format after your think tags: <SEARCH>your specific search query</SEARCH>
4. If you DO NOT need textbook knowledge (e.g. general questions like "what do you know?", "who are you?", general advice, or basic logic), DO NOT output a <SEARCH> tag at all. Just provide your final answer immediately after your think tags.

RULES:
- Your search query should be concise (1-5 words), focusing on the core scientific concept.
- Only output ONE <SEARCH> tag if you use it.
- If you do NOT output a <SEARCH> tag, your response will be sent directly to the student. In that case, it must follow this language rule: {lang_rule}
"""

    response1 = ollama.chat(
        model=settings["llm_model"],
        options={"temperature": settings["temperature"]},
        messages=[
            {"role": "system", "content": step1_prompt},
            {"role": "user", "content": request.question},
        ],
    )

    reply1 = response1["message"]["content"]

    # Extract thoughts from Step 1 so we can pass them to the UI
    step1_thoughts = ""
    think_match1 = re.search(r"<think>(.*?)</think>", reply1, re.IGNORECASE | re.DOTALL)
    if think_match1:
        step1_thoughts = f"<think>PHASE 1 (Deciding if I need to search):\n{think_match1.group(1).strip()}</think>\n\n"

    # ════════════════════════════════════════════════════
    #  STEP 2: CHECK FOR SEARCH TAG
    # ════════════════════════════════════════════════════
    search_match = re.search(r"<SEARCH>(.*?)</SEARCH>", reply1, re.IGNORECASE | re.DOTALL)
    
    # If no valid search query was found, return the direct answer
    if not search_match or search_match.group(1).strip().lower() in ["none", "no search", "no specific stem knowledge needed"]:
        # The model decided no search was needed and just answered.
        # We strip out any accidental <SEARCH> tags it might have generated anyway.
        clean_reply = re.sub(r"<SEARCH>.*?</SEARCH>", "", reply1, flags=re.IGNORECASE | re.DOTALL).strip()
        
        # Ensure the thoughts are preserved in the final output so the accordion works
        if not re.search(r"<think>", clean_reply, re.IGNORECASE):
            clean_reply = step1_thoughts + clean_reply
            
        return {
            "question": request.question,
            "context_used": [],
            "answer": clean_reply,
        }

    search_query = search_match.group(1).strip()

    # ════════════════════════════════════════════════════
    #  STEP 3: EXECUTE VECTOR SEARCH
    # ════════════════════════════════════════════════════
    query_embedding = embed_model.encode(search_query, normalize_embeddings=True)
    query_blob = serialize_f32(query_embedding.tolist())

    db = get_db()
    rows = db.execute(
        """
        SELECT c.content, c.source, v.distance
        FROM (
            SELECT rowid, distance
            FROM vec_chunks
            WHERE embedding MATCH ?
              AND k = 50
        ) v
        INNER JOIN chunks c ON c.id = v.rowid
        INNER JOIN sources s ON REPLACE(c.source, '.md', '.pdf') = s.filename
        WHERE s.is_active = 1
        ORDER BY v.distance
        LIMIT ?
        """,
        (query_blob, settings["top_k"]),
    ).fetchall()
    db.close()

    context_texts = [row[0] for row in rows]
    distances = [row[2] for row in rows]

    threshold = settings["relevance_threshold"]
    context_entries = []
    for i, (text, dist) in enumerate(zip(context_texts, distances), 1):
        relevance = "LIKELY RELEVANT" if dist < threshold else "POSSIBLY IRRELEVANT"
        context_entries.append(f"[Chunk {i} | distance={dist:.3f} | {relevance}]\n{text}")
        
    context_block = "\n\n---\n\n".join(context_entries) if context_entries else "(No context retrieved)"

    avg_distance = sum(distances) / len(distances) if distances else 1.0
    context_quality_hint = ""
    if avg_distance > threshold:
        context_quality_hint = "⚠ NOTE: The retrieved chunks have HIGH distance scores. They may be IRRELEVANT. Ignore them if they don't help."

    # ════════════════════════════════════════════════════
    #  STEP 4: FEED RESULTS BACK FOR FINAL ANSWER
    # ════════════════════════════════════════════════════
    
    step2_prompt = f"""You are an expert STEM tutor. 
The student asked: "{request.question}"

You decided to search the textbook database for: "{search_query}"
Here are the results:

{context_block}
{context_quality_hint}

Now, provide your final answer to the student's question.

RULES:
1. YOU MUST ANSWER STRICTLY USING ONLY THE PROVIDED CONTEXT. Your primary job is to summarize and explain ONLY what the textbook says about the topic. DO NOT include any outside information, fun facts, or deeper knowledge. If the context does not contain the answer, say you don't know based on the text. If the user wants to learn more than what is in the source, tell them to click the "Explain Further" button or ask you to "explain more".
2. Always output your reasoning inside <think>...</think> tags first.
3. Explain clearly and simply, like you're talking to a 5-year-old.
4. DO NOT output a <SEARCH> tag.
5. {lang_rule}
"""

    response2 = ollama.chat(
        model=settings["llm_model"],
        options={"temperature": settings["temperature"]},
        messages=[
            {"role": "system", "content": step2_prompt},
            {"role": "user", "content": request.question},
        ],
    )

    reply2 = response2["message"]["content"]
    
    # Extract Step 2 thoughts
    step2_thoughts = ""
    clean_reply2 = reply2
    think_match2 = re.search(r"<think>(.*?)</think>", reply2, re.IGNORECASE | re.DOTALL)
    if think_match2:
        step2_thoughts = f"<think>PHASE 2 (Analyzing context & answering):\n{think_match2.group(1).strip()}</think>\n\n"
        clean_reply2 = re.sub(r"<think>.*?</think>", "", reply2, flags=re.IGNORECASE | re.DOTALL).strip()
    
    # Combine the thoughts from step 1 and step 2, followed by the final answer
    combined_answer = f"{step1_thoughts}{step2_thoughts}{clean_reply2}"

    return {
        "question": request.question,
        "context_used": context_texts,
        "answer": combined_answer,
    }

# ══════════════════════════════════════════════════════
#  TEST GENERATION ENDPOINT
# ══════════════════════════════════════════════════════

class TestGenerateRequest(BaseModel):
    source_filename: str = None
    type: str
    subject: str
    level: str
    count: int

@app.post("/tests/generate")
def generate_tests(request: TestGenerateRequest):
    settings = get_settings()
    
    context_text = ""
    db = get_db()
    if request.source_filename and request.source_filename != "Barchasi":
        md_filename = request.source_filename.replace('.pdf', '.md')
        path = os.path.join(MD_OUTPUT_DIR, md_filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                context_text = f.read()[:25000]
    else:
        rows = db.execute('''
            SELECT c.content FROM chunks c 
            INNER JOIN sources s ON c.source = REPLACE(s.filename, '.pdf', '.md')
            WHERE s.is_active = 1
            ORDER BY RANDOM() LIMIT 20
        ''').fetchall()
        context_text = "\n\n".join([r[0] for r in rows])
    db.close()

    if not context_text:
        context_text = "No specific context available. Use your general knowledge."

    safe_count = min(request.count, 15)

    prompt = f"""You are an expert test creator. Generate EXACTLY {safe_count} multiple-choice questions for the subject: {request.subject}.
Level: {request.level}
Test Type: {request.type}

Use the following context to inspire your questions:
<context>
{context_text}
</context>

You MUST return the output strictly as a JSON array of objects. Do not include markdown blocks or <think> tags inside the JSON.
Format example:
[
  {{
    "q": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Rome"],
    "answer": 2
  }}
]
"""

    response = ollama.chat(
        model=settings["llm_model"],
        options={"temperature": 0.5},
        messages=[{"role": "user", "content": prompt}],
        format="json"
    )
    
    reply = response["message"]["content"]
    import json
    try:
        data = json.loads(reply)
        return {"questions": data}
    except Exception as e:
        return {"questions": [], "error": str(e), "raw": reply}
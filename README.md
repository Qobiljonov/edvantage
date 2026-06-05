<div align="center">
  <img src="frontend/public/images/icon-light.png" alt="Edvantage Logo" width="120" />

  # Edvantage - Milliy AI Ta'lim
  
  **Next-Generation AI-Powered EdTech Platform for Uzbekistan**

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Ollama](https://img.shields.io/badge/AI-Ollama%20(Deepseek--R1)-blue?style=flat)](https://ollama.ai/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br />

Edvantage is a cutting-edge educational technology platform built for AI hackathons. It seamlessly integrates a rich, modern UI with robust local Large Language Models (LLMs) to provide students with a fully personalized, engaging, and context-aware learning environment. 

Our goal is to revolutionize the way students interact with their textbooks by converting static PDFs into conversational AI tutors, dynamic roadmaps, and adaptive tests.

---

## 🚀 Key Features

### 📚 **Bilimlar Kutubxonasi (Knowledge Library)**
Upload your own textbooks, study materials, and guidelines (PDF format). The backend pipeline automatically processes, extracts, and chunks the document content, saving it into an internal database for the AI to understand and reference.

### 🧠 **AI Ustoz (AI Tutor with RAG & Reasoning)**
A powerful conversational agent that answers student queries *strictly* based on the uploaded documents. 
- **Transparent Reasoning:** It exposes its internal thought process (`<think>`/`<REASONING>` tags) in a dedicated UI dropdown, so students can see *how* the AI arrived at its answer.
- **Context-Aware:** It cites the exact context used from your uploaded PDFs, preventing hallucinations.

### 📝 **AI Test Generatori (Test Generator)**
Don't just read—practice! Select a textbook source, subject, and difficulty level, and the system dynamically generates a multiple-choice quiz using the document's context. Features a fully interactive, full-screen quiz UI that grades your answers in real-time.

### 🗺️ **O'quv Rejasi (Learning Roadmap)**
Say goodbye to generic curriculums. Edvantage reads your uploaded materials and generates a step-by-step, personalized study roadmap broken down into chapters, theoretical modules, and actionable tasks. The UI renders rich Markdown and LaTeX math formulas.

### 🏆 **Gamification (Leaderboards & Analytics)** *(Exaggerated/Vision)*
Compete with peers at the school, regional, and national levels. Earn points by chatting with the AI, completing roadmaps, and scoring high on generated tests. *(Note: The UI is beautifully implemented, but real-time multiplayer backend syncing is planned for future iterations).*

---

## 🛠️ Technical Architecture

The platform uses a split architecture optimized for speed, aesthetics, and privacy (running AI locally).

### **Frontend**
- **Framework:** [Next.js (App Router)](https://nextjs.org/) written in **TypeScript**.
- **Styling:** Highly customized **Tailwind CSS** implementing a "dark glassmorphism" aesthetic with vibrant gradients and subtle micro-animations using **Framer Motion**.
- **Components:** Radix UI primitives and Lucide React icons.
- **State & Data:** React Hooks and local state management for interactive quiz loops and roadmap generation.

### **Backend**
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python).
- **Database:** **SQLite** for storing parsed chunks, document metadata, and roadmap JSON structures.
- **AI Integration:** Uses [Ollama](https://ollama.com/) running the `deepseek-r1:1.5b` model locally. The backend utilizes sophisticated multi-prompting (router patterns, extraction, generation) to ensure the LLM stays grounded in the document context.
- **Processing Pipeline:** Asynchronous background tasks (`PyMuPDF`) extract text from PDFs, clean it, split it into chunks, and make it ready for Retrieval-Augmented Generation (RAG).

---

## 💻 Installation & Setup

To run Edvantage on your local machine, you will need **Node.js**, **Python 3.9+**, and **Ollama** installed.

### 1. Install & Run Ollama
Download and install [Ollama](https://ollama.com/). Then, pull the required local model:
```bash
ollama run deepseek-r1:1.5b
```
*(Ensure the Ollama service is running in the background).*

### 2. Setup the Backend (FastAPI)
Open a terminal and navigate to the `server` directory:
```bash
cd server

# (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
The backend API will be available at `http://127.0.0.1:8000`.

### 3. Setup the Frontend (Next.js)
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
The web application will be available at `http://localhost:3000`.

---

## 🎯 Usage Flow
1. Navigate to `http://localhost:3000/dashboard/kutubxona`.
2. Click **Fayl tanlash** and upload a `.pdf` textbook. Wait for its status to change from "Jarayonda" (Processing) to "PDF".
3. Navigate to **AI Ustoz** to ask questions based on the uploaded book.
4. Navigate to **Test Generatori** to generate an interactive quiz from your book.
5. Navigate to **Bilim Dvigateli** to generate a structured study roadmap.

Enjoy the future of AI education!

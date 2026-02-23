<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=3000&pause=1000&color=6C63FF&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=%F0%9F%9A%80+Training+Projects+Codebase;Full-Stack+%7C+AI%2FML+%7C+Data+Structures" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Projects-14-6C63FF?style=for-the-badge" alt="Projects" />
  <img src="https://img.shields.io/badge/Languages-Python%20%7C%20TypeScript%20%7C%20Java-blue?style=for-the-badge" alt="Languages" />
  <img src="https://img.shields.io/badge/Status-Active-00C853?style=for-the-badge" alt="Status" />
</p>

<p align="center">
  A comprehensive portfolio of <strong>14 training projects</strong> spanning full-stack web development, AI/ML, real-time systems, and data structures — built with modern frameworks and best practices.
</p>

---

## 🗺️ Project Map

```
Training/
│
├── 🔗 APIs & Integrations
│   ├── 1.SheetsApi            → Google Sheets REST API
│   └── 2.GoogleSheetsLLM      → LLM Chat + Sheets Logging
│
├── 📚 Full-Stack Applications
│   ├── 3.LMS                  → Learning Management System
│   ├── 5.Calc-Student-TextEditor → Multi-Tool Flask App
│   ├── 6.ChatApplication      → Real-Time Chat (WebSockets)
│   ├── 11.HRMSFS              → HR Management System (40 tables)
│   └── 12.UMS                 → University Placement Portal
│
├── 🤖 AI / ML Projects
│   ├── 4.MLAPI                → Fruit Predictor API
│   ├── 7.Agent                → Math AI Agent (ReAct)
│   ├── 8.VideoGenHF           → AI Video Generator
│   ├── 9.OCR                  → DL OCR Comparison System
│   └── 13.MLSELECTOR          → ML Insight Explorer
│
├── 🧠 Visualization
│   └── 10.MindMapHRM          → Interactive HRMS Schema Map
│
├── 🌤️ Upcoming
│   └── 14.WeatherAPI          → Weather API (In Progress)
│
└── 🧩 CodesR                  → Algorithms, DS & Mini-Tools
```

---

## 📋 Projects Overview

### 🔗 APIs & Integrations

<table>
<tr>
<td width="50%">

#### 1. SheetsApi
**`1.SheetsApi/`**

REST API for managing employee records stored directly in Google Sheets.

| | |
|---|---|
| **Features** | Auto-generated IDs, Create & Read employees |
| **Stack** | FastAPI, Google Sheets API v4, Pydantic |
| **Run** | `uvicorn app:app --reload` |

</td>
<td width="50%">

#### 2. GoogleSheetsLLM
**`2.GoogleSheetsLLM/`**

Interactive AI chatbot (TinyLlama) that logs every conversation to Google Sheets.

| | |
|---|---|
| **Features** | Gradio UI, Google OAuth, Sheet logging |
| **Stack** | Gradio, Transformers, Google OAuth |
| **Run** | `python app.py` |

</td>
</tr>
</table>

---

### 📚 Full-Stack Applications

<table>
<tr>
<td width="50%">

#### 3. LMS — Learning Management System
**`3.LMS/`**

Full-stack Student Management System with FastAPI backend and Flask frontend.

| | |
|---|---|
| **Features** | CRUD, soft delete, pagination, filtering |
| **Stack** | FastAPI, PostgreSQL, SQLAlchemy, Flask, Jinja2 |
| **Backend** | `uvicorn main:app --reload` |
| **Frontend** | `cd flask_frontend && python app.py` |

</td>
<td width="50%">

#### 5. Calc-Student-TextEditor
**`5.Calc-Student-TextEditor/`**

Multi-purpose Flask app bundling three distinct tools in one.

| | |
|---|---|
| **Tools** | 🧮 Stack Calculator · 📝 Text Editor (Undo/Redo) · 👨‍🎓 Student Manager |
| **Stack** | Flask |
| **Run** | `python app.py` → `http://localhost:5000` |

</td>
</tr>
<tr>
<td width="50%">

#### 6. ChatApplication
**`6.ChatApplication/`**

Real-time chat application with user authentication and persistent history.

| | |
|---|---|
| **Features** | JWT Auth, Private & Group chats, WebSocket messaging |
| **Stack** | FastAPI, MongoDB (Motor), WebSockets, HTML/JS |
| **Run** | `uvicorn main:app --reload` |

</td>
<td width="50%">

#### 11. HRMSFS — HR Management System
**`11.HRMSFS/`**

Full CRUD API covering **40 database tables** across every HR domain, with a premium React frontend featuring 17 module pages.

| | |
|---|---|
| **Features** | 40-table CRUD, Google SSO, Dark/Light theme, 17 pages |
| **Stack** | FastAPI, Supabase (PostgreSQL), React 19, Vite 7 |
| **Backend** | `uvicorn main:app --reload` |
| **Frontend** | `cd frontend && npm run dev` |

</td>
</tr>
<tr>
<td colspan="2">

#### 12. UMS — University Placement Portal 🎓
**`12.UMS/`**

> **Largest project** — A comprehensive campus placement management system for LPU with role-based dashboards, drive management, document uploads, messaging, and in-app notifications.

| | |
|---|---|
| **Roles** | Student, Admin, TPC, Faculty, Super Admin |
| **Backend** | FastAPI + Supabase · 10 API modules · JWT + RBAC |
| **Frontend** | Next.js 14 + TypeScript · 14 dashboard pages · Dark/Light theme |
| **Database** | Supabase PostgreSQL · 15+ tables · pgcrypto auth |
| **Storage** | Supabase Storage (resumes, certificates, offer letters) |
| **Run** | Backend: `uvicorn app.main:app --reload` · Frontend: `npm run dev` |

</td>
</tr>
</table>

---

### 🤖 AI / Machine Learning

<table>
<tr>
<td width="50%">

#### 4. MLAPI — Fruit Predictor
**`4.MLAPI/`**

Simple ML API that predicts fruit type from physical characteristics.

| | |
|---|---|
| **Model** | Decision Tree Classifier (Apple vs Orange) |
| **Interfaces** | FastAPI REST API + Gradio Web UI |
| **Stack** | FastAPI, Scikit-learn, NumPy, Gradio |

</td>
<td width="50%">

#### 7. Agent — Math AI
**`7.Agent/`**

Autonomous AI agent that solves multi-step math problems using a Thought → Action → Observation loop.

| | |
|---|---|
| **Model** | Qwen2.5-Coder:7b via Ollama |
| **Pattern** | ReAct (tool-calling, no hallucinated math) |
| **Interfaces** | Web UI (Tailwind) + CLI |
| **Stack** | FastAPI, Ollama, Python |

</td>
</tr>
<tr>
<td width="50%">

#### 8. VideoGenHF — Vintage Bike Generator 🏍️
**`8.VideoGenHF/`**

Context-specific AI video & image generator for vintage motorcycle content, optimized for low-VRAM GPUs.

| | |
|---|---|
| **Model** | ModelScope text-to-video 1.7B |
| **Output** | 16-frame videos @ 256×256, MP4 & GIF export |
| **Env** | Google Colab T4 / RTX 3050 |
| **Stack** | PyTorch, Diffusers, Streamlit, MoviePy |

</td>
<td width="50%">

#### 9. OCR — DL Comparison System
**`9.OCR/`**

Offline OCR system for Indian Driving Licenses comparing traditional vs modern VLM approaches.

| | |
|---|---|
| **Approach 1** | Pytesseract + PaddleOCR (traditional) |
| **Approach 2** | OlmOCR-2-7B / Florence-2 (VLM) |
| **Metrics** | CER, Levenshtein distance, accuracy % |
| **Stack** | FastAPI, Pytesseract, Transformers, SQLite |

</td>
</tr>
<tr>
<td colspan="2">

#### 13. ML Insight Explorer 🧠
**`13.MLSELECTOR/`**

> **Interactive, educational ML platform** — pick a real dataset, explore it visually, train models, and understand every metric with plain-English explanations.

| | |
|---|---|
| **Datasets** | Credit Card Segmentation (9K rows) · London House Prices (40K) · Backpack Prices (24K) |
| **ML Tasks** | Classification · Regression · Clustering |
| **Models** | 12 models — Logistic Regression, Random Forest, SVM, Gradient Boosting, KMeans, DBSCAN, etc. |
| **Visuals** | Correlation heatmaps, Elbow method, Silhouette curves, PCA scatter, Actual vs Predicted |
| **Stack** | FastAPI, scikit-learn, Next.js 16, TypeScript, Tailwind v4, Recharts |
| **Run** | Backend: `cd backend && uvicorn main:app --reload` · Frontend: `cd frontend && npm run dev` |

</td>
</tr>
</table>

---

### 🧠 Visualization

<table>
<tr>
<td>

#### 10. MindMapHRM — Interactive Schema Visualizer
**`10.MindMapHRM/`**

Explore the full **40-table HRMS database schema** as a drag-and-drop mind map with React Flow.

| | |
|---|---|
| **Features** | Pan/zoom canvas, color-coded domains, detail panel, sidebar search, dark/light theme |
| **Domains** | Employees, Payroll, Recruitment, Performance, Training, Benefits, Assets, and more |
| **Stack** | React 19, Vite 7, React Flow 11, Vanilla CSS |
| **Run** | `npm run dev` → `http://localhost:5173` |

</td>
</tr>
</table>

---

### 🧩 CodesR — Algorithms & Mini-Projects
**`CodesR/`**

> A growing collection of standalone **algorithms, data structures, visualizations, and mini-tools**.

| # | File / Folder | Project | Language |
|---|---|---|---|
| 1 | `graph.py` | 🦸 **Avengers Compatibility Graph** — weighted directed graph with interactive highlighting | Python |
| 2 | `got.py` | 🐉 **Royal Lineage CLI** — Targaryen family tree explorer | Python |
| 3 | `got_visualizer.py` | 🐉 **Royal Lineage Visualizer** — ANSI tree + interactive HTML/D3.js visualization | Python |
| 4 | `b.py` | 🌳 **Decision Tree Visualizer** — number guessing with path highlighting | Python |
| 5 | `a.py` | 🤖 **Math Agent Experiment** — Ollama-based math solver prototype | Python |
| 6 | `a (2).py` | 🌲 **BST Graph Drawer** — NetworkX binary search tree visualization | Python |
| 7 | `hp.py` | 🗂️ **Custom Hash Map** — chaining collision resolution | Python |
| 8 | `queue.py` | 🎫 **Ticket Management System** — circular queue with CLI | Python |
| 9 | `app.py` | ⚡ **Flask + Uvicorn Demo** — WSGI→ASGI bridge demo | Python |
| 10 | `bst.java` | 🌲 **Binary Search Tree** — full BST implementation | Java |
| 11 | `dp/ClimbStairs.java` | 🧗 **Climbing Stairs** — Recursion, Memo, Tabulation | Java |
| 12 | `dp/fib.java` | 🔢 **Fibonacci** — Memoization & Tabulation | Java |
| 13 | `a.html` | 🌧️ **Rain Water Trapping Visualizer** — Canvas step-through animation | HTML/JS |
| 14 | `targaryen_lineage.html` | 🐉 **Targaryen Family Tree** — interactive browser visualization | HTML/JS |
| 15 | `ticket-ai-system/` | 🎟️ **AI Ticket Router** — FastAPI scaffold for intelligent ticket routing | Python |

---

## ⚡ Tech Radar

<table>
<tr>
<td align="center" width="14%"><strong>🐍 Python</strong><br/><sub>FastAPI, Flask</sub></td>
<td align="center" width="14%"><strong>⚛️ React</strong><br/><sub>Next.js, Vite</sub></td>
<td align="center" width="14%"><strong>🤖 ML/AI</strong><br/><sub>scikit-learn, Transformers</sub></td>
<td align="center" width="14%"><strong>🗄️ Databases</strong><br/><sub>PostgreSQL, MongoDB, SQLite, Supabase</sub></td>
<td align="center" width="14%"><strong>🔐 Auth</strong><br/><sub>JWT, Google OAuth, RBAC</sub></td>
<td align="center" width="14%"><strong>📡 Real-Time</strong><br/><sub>WebSockets, Motor</sub></td>
<td align="center" width="14%"><strong>🎨 Frontend</strong><br/><sub>TypeScript, Tailwind, CSS</sub></td>
</tr>
</table>

---

## 🚀 Getting Started

Each project is self-contained within its own directory. Navigate to any project folder and follow the instructions in its `README.md`.

### General Pattern

```bash
# Backend (Python projects)
cd <project-folder>
pip install -r requirements.txt
uvicorn main:app --reload          # or python app.py

# Frontend (Node.js projects)  
cd <project-folder>/frontend
npm install
npm run dev
```

### Quick Reference

| Project | Backend Port | Frontend Port | DB |
|---|---|---|---|
| 1. SheetsApi | `8000` | — | Google Sheets |
| 2. GoogleSheetsLLM | `7860` | — | Google Sheets |
| 3. LMS | `8000` | `5000` | PostgreSQL |
| 4. MLAPI | `8000` | — | — |
| 5. Calc-Student-TextEditor | `5000` | — | In-Memory |
| 6. ChatApplication | `8000` | Templates | MongoDB |
| 7. Agent | `8000` | Templates | — |
| 8. VideoGenHF | — | Streamlit | — |
| 9. OCR | `8000` | Static | SQLite |
| 10. MindMapHRM | — | `5173` | — |
| 11. HRMSFS | `8000` | `5173` | Supabase |
| 12. UMS | `8000` | `3000` | Supabase |
| 13. MLSELECTOR | `8000` | `3000` | — |
| 14. WeatherAPI | 🔜 | 🔜 | 🔜 |

---

## 📊 Project Complexity Matrix

```
         Simple ─────────────────────────────────── Complex
         │                                              │
  1.     ██░░░░░░░░░░   SheetsApi                       │
  2.     ███░░░░░░░░░   GoogleSheetsLLM                 │
  4.     ███░░░░░░░░░   MLAPI                           │
  5.     ████░░░░░░░░   Calc-Student-TextEditor          │
  3.     █████░░░░░░░   LMS                              │
  7.     █████░░░░░░░   Agent                            │
  8.     ██████░░░░░░   VideoGenHF                       │
 10.     ██████░░░░░░   MindMapHRM                       │
  6.     ███████░░░░░   ChatApplication                  │
  9.     ████████░░░░   OCR                              │
 11.     █████████░░░   HRMSFS                           │
 13.     █████████░░░   MLSELECTOR                       │
 12.     ██████████░░   UMS (Placement Portal)           │
         │                                              │
         └──────────────────────────────────────────────┘
```

---

<p align="center">
  <sub>Built with ❤️ as a continuous learning journey — from simple APIs to full-stack enterprise systems</sub>
</p>

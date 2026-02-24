# 📚 LMS — Learning Management System

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)

*A full-stack Student Management System with a FastAPI REST backend and a Flask + Jinja2 server-rendered frontend.*

</div>

---

## 🎯 What It Does

A complete **CRUD application** for managing student records. The backend exposes a REST API for creating, reading, updating, and deleting students. The Flask frontend consumes the API and renders a clean web interface. Supports **soft delete**, **pagination**, and **search/filter** capabilities.

---

## 🏗️ Architecture

```
┌──────────────────────────────────┐
│  Flask Frontend (:5000)          │
│  ┌──────────────────────────┐    │
│  │  Jinja2 Templates        │    │
│  │  - Student List (table)  │    │
│  │  - Add / Edit forms      │    │
│  │  - Search & Filters      │    │
│  └──────────┬───────────────┘    │
└─────────────┼────────────────────┘
              │ HTTP (requests)
              ▼
┌──────────────────────────────────┐
│  FastAPI Backend (:8000)         │
│  ├── POST   /students/           │
│  ├── GET    /students/           │
│  ├── GET    /students/{id}       │
│  ├── PUT    /students/{id}       │
│  ├── DELETE /students/{id}       │
│  └── SQLAlchemy ORM              │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  PostgreSQL Database             │
│  └── students table              │
└──────────────────────────────────┘
```

---

## 📂 Project Structure

```
3.LMS/
├── main.py                  # FastAPI backend (routes + SQLAlchemy models)
├── flask_frontend/
│   ├── app.py               # Flask frontend (consumes the FastAPI API)
│   └── templates/           # Jinja2 HTML templates
├── requirements.txt         # Python dependencies
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **📝 Full CRUD** | Create, Read, Update, Delete student records |
| **🗑️ Soft Delete** | Records are marked as deleted, not permanently removed |
| **📄 Pagination** | Efficiently browse through large student lists |
| **🔍 Search & Filter** | Find students by name, department, or other fields |
| **✅ Validation** | Pydantic models enforce data integrity (email format, required fields) |
| **🖥️ Server-Rendered UI** | Flask + Jinja2 frontend with forms and tables |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | FastAPI, Uvicorn |
| **ORM** | SQLAlchemy |
| **Database** | PostgreSQL |
| **Validation** | Pydantic v2 (with email validation) |
| **Frontend** | Flask, Jinja2, HTML/CSS |
| **HTTP Client** | `requests` (Flask → FastAPI) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.x
- PostgreSQL database running locally

### 1. Install Dependencies

```bash
# Backend
pip install fastapi uvicorn sqlalchemy pydantic psycopg2-binary "pydantic[email]"

# Frontend
pip install flask requests
```

### 2. Configure Database

Update the `DATABASE_URL` in `main.py` with your PostgreSQL credentials:
```python
DATABASE_URL = "postgresql://postgres:yourpassword@localhost:5432/mydatabase"
```

### 3. Start the Backend

```bash
uvicorn main:app --reload
```
→ API available at **http://localhost:8000**
→ Swagger docs at **http://localhost:8000/docs**

### 4. Start the Frontend

In a **new terminal**:
```bash
cd flask_frontend
python app.py
```
→ Web UI at **http://localhost:5000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/students/` | Create a new student |
| `GET` | `/students/` | List all students (with pagination & filtering) |
| `GET` | `/students/{id}` | Get a single student by ID |
| `PUT` | `/students/{id}` | Update a student record |
| `DELETE` | `/students/{id}` | Soft-delete a student |

---

*Full-stack CRUD — FastAPI backend meets Flask frontend* 📚

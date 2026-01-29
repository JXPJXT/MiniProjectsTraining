# Training Projects Codebase

This repository contains a collection of training projects demonstrating various web development technologies, including FastAPI, Flask, Google APIs, Machine Learning, and Real-time communication.

## Projects Overview

### 1. SheetsApi
**Directory:** `1.SheetsApi/`
- **Description:** A REST API for managing employee records stored directly in a Google Sheet.
- **Key Features:**
    - Create new employees (Name, Department, Salary).
    - Read employee details by name.
    - Employee IDs are auto-generated based on existing rows.
- **Tech Stack:** FastAPI, Google Sheets API (v4), Pydantic.

### 2. GoogleSheetsLLM
**Directory:** `2.GoogleSheetsLLM/`
- **Description:** An interactive chat application powered by a local LLM (`TinyLlama`) that logs conversation history to a Google Sheet.
- **Key Features:**
    - AI Chat interface using Gradio.
    - Google OAuth authentication.
    - Logs user and bot messages to Google Sheets.
- **Tech Stack:** Gradio, Transformers (TinyLlama), Google OAuth, FastAPI.

### 3. LMS (Learning Management System)
**Directory:** `3.LMS/`
- **Description:** A full-stack Student Management System.
- **Components:**
    - **Backend (`main.py`):** FastAPI application providing CRUD endpoints for students using a PostgreSQL database.
    - **Frontend (`flask_frontend/`):** Flask application serving a UI to interact with the backend API.
- **Key Features:**
    - Create, Read, Update, Delete (CRUD) students.
    - Soft delete functionality.
    - Pagination and filtering.
- **Tech Stack:** FastAPI, PostgreSQL, SQLAlchemy, Flask, Jinja2.

### 4. MLAPI (Fruit Predictor)
**Directory:** `4.MLAPI/`
- **Description:** A simple Machine Learning API that predicts the type of fruit based on physical characteristics.
- **Key Features:**
    - Predicts "Apple" or "Orange" based on texture and color code.
    - Uses a pre-trained Decision Tree Classifier.
- **Tech Stack:** FastAPI, Scikit-learn, Numpy.

### 5. Calc-Student-TextEditor
**Directory:** `5.Calc-Student-TextEditor/`
- **Description:** A multi-purpose Flask application bundling three distinct tools.
- **Tools:**
    1.  **Calculator:** A stack-based (RPN style) calculator.
    2.  **Text Editor:** A simple command-based text editor (Add, Undo, Redo, Remove).
    3.  **Student Manager:** A basic in-memory student list manager.
- **Tech Stack:** Flask.

### 6. ChatApplication
**Directory:** `6.ChatApplication/`
- **Description:** A real-time chat application with user authentication.
- **Key Features:**
    - User Registration and Login (JWT Auth).
    - Private and Group chats.
    - Real-time messaging using WebSockets.
    - Persistent message history in MongoDB.
- **Tech Stack:** FastAPI, MongoDB (Motor), WebSockets, HTML/JS Frontend (Templates).

## Getting Started

Each project is contained within its own directory. To run a specific project, navigate to its folder and check for a `requirements.txt` file to install dependencies.

```bash
# Example for SheetsApi
cd 1.SheetsApi
pip install -r requirements.txt
uvicorn app:app --reload
```

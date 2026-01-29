# LMS (Learning Management System)

This project consists of a FastAPI backend for Student Management and a Flask-based Frontend.

## Components

1.  **Backend (`main.py`)**: A FastAPI application using PostgreSQL.
2.  **Frontend (`flask_frontend/app.py`)**: A Flask application serving the UI.

## Prerequisites

- Python 3.x
- PostgreSQL database (configured in `main.py`).
- `pip`.

## Installation

1.  Install backend dependencies:

    ```bash
    pip install fastapi uvicorn sqlalchemy pydantic psycopg2-binary "pydantic[email]"
    ```
2.  Install frontend dependencies:

    ```bash
    pip install flask requests
    ```

## Configuration

- Update the `DATABASE_URL` in `main.py` with your PostgreSQL credentials.
  Default: `postgresql://postgres:Tinku%40123@localhost:5432/mydatabase`

## Running the Application

### 1. Start the Backend

Run the FastAPI server from the root of this directory:

```bash
uvicorn main:app --reload
```

Server runs on `http://127.0.0.1:8000`.

### 2. Start the Frontend

Open a new terminal, navigate to `flask_frontend`, and run:

```bash
cd flask_frontend
python app.py
```

The UI will be available (usually at `http://127.0.0.1:5000`).

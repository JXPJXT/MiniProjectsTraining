# 📊 SheetsApi — Google Sheets Employee Manager

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)

*A REST API that uses Google Sheets as its database — create and retrieve employee records through a clean API & web UI.*

</div>

---

## 🎯 What It Does

Instead of a traditional database, this project stores employee data **directly in a Google Sheet**. The FastAPI backend handles all CRUD operations, auto-generates unique IDs, and exposes a simple REST API. A minimal HTML frontend is included for quick interaction.

---

## 🏗️ Architecture

```
┌──────────────────────────┐       ┌──────────────────────┐
│   Frontend (index.html)  │ ───── │  FastAPI Backend      │
│   Simple form UI         │  HTTP │  app.py               │
└──────────────────────────┘       │  - POST /employee     │
                                   │  - GET  /employee/{n} │
                                   └──────────┬───────────┘
                                              │ Google Sheets API v4
                                              ▼
                                   ┌──────────────────────┐
                                   │  Google Sheets        │
                                   │  (Cloud Spreadsheet)  │
                                   └──────────────────────┘
```

---

## 📂 Project Structure

```
1.SheetsApi/
├── app.py                # FastAPI application (routes + Sheets client)
├── client_secret.json    # Google Service Account credentials (not committed)
├── index.html            # Simple web form for testing
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Auto-Generated IDs** | Each new employee gets a unique sequential ID automatically |
| **Create Employee** | `POST /employee` — adds name, department, salary to the sheet |
| **Read Employee** | `GET /employee/{name}` — searches the sheet by name and returns the row |
| **Google Sheets as DB** | Zero database setup — just a Google Sheet |
| **Web UI** | `index.html` provides a simple form to test the API |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, Uvicorn |
| **Data Store** | Google Sheets API v4 |
| **Auth** | Google Service Account (OAuth2) |
| **Validation** | Pydantic |
| **Frontend** | HTML + JavaScript |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.x
- A Google Cloud project with Sheets API enabled
- A Service Account `client_secret.json` file

### 1. Install Dependencies

```bash
pip install fastapi uvicorn google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client pydantic
```

### 2. Configure

1. Place `client_secret.json` in this directory
2. Update `SPREADSHEET_ID` in `app.py` with your Google Sheet ID
3. Share the Google Sheet with the service account email

### 3. Run

```bash
uvicorn app:app --reload
```

The API is live at **http://localhost:8000**.

### 4. Test

Open `index.html` in your browser, or use the API directly:

```bash
# Create an employee
curl -X POST http://localhost:8000/employee \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "department": "Engineering", "salary": 50000}'

# Get an employee
curl http://localhost:8000/employee/John%20Doe
```

---

## 📡 API Endpoints

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/employee` | `{"name", "department", "salary"}` | Create a new employee |
| `GET` | `/employee/{name}` | — | Retrieve an employee by name |

---

*Simple yet powerful — Google Sheets as a backend database* 📊

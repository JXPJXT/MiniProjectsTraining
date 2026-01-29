# SheetsApi

This project provides a FastAPI backend that interacts with Google Sheets to store and retrieve employee data.

## Prerequisites

- Python 3.x
- Google Service Account Credentials (`client_secret.json`) placed in this directory.
- `pip` installed.

## Installation

1.  Clone the repository or navigate to this directory.
2.  Install the required dependencies:

    ```bash
    pip install fastapi uvicorn google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client pydantic
    ```

    (Or use `pip install -r requirements.txt` if available)

## Configuration

- Ensure `client_secret.json` is present in the root of this folder.
- Update `SPREADSHEET_ID` in `app.py` if necessary.

## Running the Application

Start the FastAPI server:

```bash
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`.

## API Endpoints

-   **POST** `/employee`: Create a new employee.
    -   Body: `{"name": "John Doe", "department": "Engineering", "salary": 50000}`
-   **GET** `/employee/{name}`: Retrieve an employee by name.

## Frontend

Open `index.html` in your browser to interact with the API via a simple user interface.

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERV_ACC = 'SERVICE_ACCOUNT_FILE.json' 
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SPREADSHEET_ID = '1JXb15ovWyI0NxvxQ57kzstcepHSGMX4LJYTNFF3vMQc'
RANGE_NAME = 'Sheet1!A:D'

def get_service():
    creds = service_account.Credentials.from_service_account_file(
        SERV_ACC, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)
    return service

class Employee(BaseModel):
    name: str
    department: str
    salary: float

@app.post("/employee")
def create_employee(employee: Employee):
    service = get_service()
    sheet = service.spreadsheets()
    
    result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                range=RANGE_NAME).execute()
    values = result.get('values', [])
    
    new_id = 1
    if values and len(values) > 1:
        try:
            ids = [int(row[0]) for row in values[1:] if row and row[0].isdigit()]
            if ids:
                new_id = max(ids) + 1
        except Exception:
            pass
    elif values and len(values) == 1 and values[0] and values[0][0].isdigit():
        try:
            new_id = int(values[0][0]) + 1
        except:
            pass

    row = [new_id, employee.name, employee.department, employee.salary]
    body = {
        'values': [row]
    }
    result = sheet.values().append(
        spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME,
        valueInputOption='USER_ENTERED', body=body).execute()
        
    return {"message": "Employee added", "id": new_id, "row": row}

@app.get("/employee/{name}")
def get_employee(name: str):
    service = get_service()
    sheet = service.spreadsheets()
    
    result = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                range=RANGE_NAME).execute()
    values = result.get('values', [])
    
    if not values:
        raise HTTPException(status_code=404, detail="No data found")

    for row in values:
        if len(row) > 1 and row[1].strip().lower() == name.strip().lower():
            return {
                "id": row[0],
                "name": row[1],
                "department": row[2] if len(row) > 2 else None,
                "salary": row[3] if len(row) > 3 else None
            }
            
    raise HTTPException(status_code=404, detail="Employee not found")

@app.get("/")
def read_root():
    return {"message": "Employee API is running"}
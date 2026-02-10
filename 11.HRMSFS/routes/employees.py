"""
Routes for employees, employee_positions, employee_documents, employee_skills.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.employees import (
    EmployeeCreate, EmployeeUpdate, EmployeeOut,
    EmployeePositionCreate, EmployeePositionUpdate, EmployeePositionOut,
    EmployeeDocumentCreate, EmployeeDocumentUpdate, EmployeeDocumentOut,
    EmployeeSkillCreate, EmployeeSkillUpdate, EmployeeSkillOut,
)
import crud

router = APIRouter(prefix="/employees", tags=["Employees"])


# ── Employees CRUD ───────────────────────────────────────────────────────────

@router.get("/", summary="List employees")
def list_employees(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    dept_id: Optional[int] = None,
):
    filters = {}
    if status:
        filters["status"] = status
    if dept_id:
        filters["dept_id"] = dept_id
    return crud.list_records("employees", limit=limit, offset=offset, order_by="emp_id", filters=filters or None)


@router.get("/{emp_id}", summary="Get employee by ID")
def get_employee(emp_id: int):
    return crud.get_record("employees", "emp_id", emp_id)


@router.post("/", status_code=201, summary="Create employee")
def create_employee(body: EmployeeCreate):
    return crud.create_record("employees", body.model_dump())


@router.put("/{emp_id}", summary="Update employee")
def update_employee(emp_id: int, body: EmployeeUpdate):
    return crud.update_record("employees", "emp_id", emp_id, body.model_dump(exclude_unset=True))


@router.delete("/{emp_id}", summary="Delete employee")
def delete_employee(emp_id: int):
    return crud.delete_record("employees", "emp_id", emp_id)


# ── Employee Positions CRUD ─────────────────────────────────────────────────

@router.get("/{emp_id}/positions", summary="List positions for an employee")
def list_employee_positions(emp_id: int, limit: int = 100, offset: int = 0):
    return crud.list_records("employee_positions", limit=limit, offset=offset, filters={"emp_id": emp_id})


@router.post("/{emp_id}/positions", status_code=201, summary="Assign position to employee")
def create_employee_position(emp_id: int, body: EmployeePositionCreate):
    data = body.model_dump()
    data["emp_id"] = emp_id
    return crud.create_record("employee_positions", data)


@router.put("/positions/{id}", summary="Update employee position")
def update_employee_position(id: int, body: EmployeePositionUpdate):
    return crud.update_record("employee_positions", "id", id, body.model_dump(exclude_unset=True))


@router.delete("/positions/{id}", summary="Delete employee position")
def delete_employee_position(id: int):
    return crud.delete_record("employee_positions", "id", id)


# ── Employee Documents CRUD ─────────────────────────────────────────────────

@router.get("/{emp_id}/documents", summary="List documents for an employee")
def list_employee_documents(emp_id: int, limit: int = 100, offset: int = 0):
    return crud.list_records("employee_documents", limit=limit, offset=offset, filters={"emp_id": emp_id})


@router.post("/{emp_id}/documents", status_code=201, summary="Upload employee document")
def create_employee_document(emp_id: int, body: EmployeeDocumentCreate):
    data = body.model_dump()
    data["emp_id"] = emp_id
    return crud.create_record("employee_documents", data)


@router.put("/documents/{doc_id}", summary="Update employee document")
def update_employee_document(doc_id: int, body: EmployeeDocumentUpdate):
    return crud.update_record("employee_documents", "doc_id", doc_id, body.model_dump(exclude_unset=True))


@router.delete("/documents/{doc_id}", summary="Delete employee document")
def delete_employee_document(doc_id: int):
    return crud.delete_record("employee_documents", "doc_id", doc_id)


# ── Employee Skills CRUD ────────────────────────────────────────────────────

@router.get("/{emp_id}/skills", summary="List skills for an employee")
def list_employee_skills(emp_id: int, limit: int = 100, offset: int = 0):
    return crud.list_records("employee_skills", limit=limit, offset=offset, filters={"emp_id": emp_id})


@router.post("/{emp_id}/skills", status_code=201, summary="Add skill to employee")
def create_employee_skill(emp_id: int, body: EmployeeSkillCreate):
    data = body.model_dump()
    data["emp_id"] = emp_id
    return crud.create_record("employee_skills", data)


@router.put("/skills/{emp_skill_id}", summary="Update employee skill")
def update_employee_skill(emp_skill_id: int, body: EmployeeSkillUpdate):
    return crud.update_record("employee_skills", "emp_skill_id", emp_skill_id, body.model_dump(exclude_unset=True))


@router.delete("/skills/{emp_skill_id}", summary="Delete employee skill")
def delete_employee_skill(emp_skill_id: int):
    return crud.delete_record("employee_skills", "emp_skill_id", emp_skill_id)

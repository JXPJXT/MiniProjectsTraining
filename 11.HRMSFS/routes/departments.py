"""
Routes for departments, positions, grades, position_grades.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.departments import (
    DepartmentCreate, DepartmentUpdate, DepartmentOut,
    PositionCreate, PositionUpdate, PositionOut,
    GradeCreate, GradeUpdate, GradeOut,
    PositionGradeCreate, PositionGradeUpdate, PositionGradeOut,
)
import crud

router = APIRouter(tags=["Organization Structure"])


# ── Departments ──────────────────────────────────────────────────────────────

@router.get("/departments", summary="List departments")
def list_departments(limit: int = 100, offset: int = 0):
    return crud.list_records("departments", limit=limit, offset=offset, order_by="dept_id")


@router.get("/departments/{dept_id}", summary="Get department by ID")
def get_department(dept_id: int):
    return crud.get_record("departments", "dept_id", dept_id)


@router.post("/departments", status_code=201, summary="Create department")
def create_department(body: DepartmentCreate):
    return crud.create_record("departments", body.model_dump())


@router.put("/departments/{dept_id}", summary="Update department")
def update_department(dept_id: int, body: DepartmentUpdate):
    return crud.update_record("departments", "dept_id", dept_id, body.model_dump(exclude_unset=True))


@router.delete("/departments/{dept_id}", summary="Delete department")
def delete_department(dept_id: int):
    return crud.delete_record("departments", "dept_id", dept_id)


# ── Positions ────────────────────────────────────────────────────────────────

@router.get("/positions", summary="List positions")
def list_positions(limit: int = 100, offset: int = 0, dept_id: Optional[int] = None):
    filters = {"dept_id": dept_id} if dept_id else None
    return crud.list_records("positions", limit=limit, offset=offset, order_by="position_id", filters=filters)


@router.get("/positions/{position_id}", summary="Get position by ID")
def get_position(position_id: int):
    return crud.get_record("positions", "position_id", position_id)


@router.post("/positions", status_code=201, summary="Create position")
def create_position(body: PositionCreate):
    return crud.create_record("positions", body.model_dump())


@router.put("/positions/{position_id}", summary="Update position")
def update_position(position_id: int, body: PositionUpdate):
    return crud.update_record("positions", "position_id", position_id, body.model_dump(exclude_unset=True))


@router.delete("/positions/{position_id}", summary="Delete position")
def delete_position(position_id: int):
    return crud.delete_record("positions", "position_id", position_id)


# ── Grades ───────────────────────────────────────────────────────────────────

@router.get("/grades", summary="List grades")
def list_grades(limit: int = 100, offset: int = 0):
    return crud.list_records("grades", limit=limit, offset=offset, order_by="grade_id")


@router.get("/grades/{grade_id}", summary="Get grade by ID")
def get_grade(grade_id: int):
    return crud.get_record("grades", "grade_id", grade_id)


@router.post("/grades", status_code=201, summary="Create grade")
def create_grade(body: GradeCreate):
    return crud.create_record("grades", body.model_dump())


@router.put("/grades/{grade_id}", summary="Update grade")
def update_grade(grade_id: int, body: GradeUpdate):
    return crud.update_record("grades", "grade_id", grade_id, body.model_dump(exclude_unset=True))


@router.delete("/grades/{grade_id}", summary="Delete grade")
def delete_grade(grade_id: int):
    return crud.delete_record("grades", "grade_id", grade_id)


# ── Position Grades ──────────────────────────────────────────────────────────

@router.get("/position-grades", summary="List position-grade mappings")
def list_position_grades(limit: int = 100, offset: int = 0, position_id: Optional[int] = None):
    filters = {"position_id": position_id} if position_id else None
    return crud.list_records("position_grades", limit=limit, offset=offset, filters=filters)


@router.get("/position-grades/{position_grade_id}", summary="Get position-grade mapping")
def get_position_grade(position_grade_id: int):
    return crud.get_record("position_grades", "position_grade_id", position_grade_id)


@router.post("/position-grades", status_code=201, summary="Create position-grade mapping")
def create_position_grade(body: PositionGradeCreate):
    return crud.create_record("position_grades", body.model_dump())


@router.put("/position-grades/{position_grade_id}", summary="Update position-grade mapping")
def update_position_grade(position_grade_id: int, body: PositionGradeUpdate):
    return crud.update_record("position_grades", "position_grade_id", position_grade_id, body.model_dump(exclude_unset=True))


@router.delete("/position-grades/{position_grade_id}", summary="Delete position-grade mapping")
def delete_position_grade(position_grade_id: int):
    return crud.delete_record("position_grades", "position_grade_id", position_grade_id)

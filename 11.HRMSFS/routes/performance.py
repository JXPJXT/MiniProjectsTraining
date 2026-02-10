"""
Routes for performance_reviews, performance_goals,
performance_feedback, kpis, employee_kpis.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.performance import (
    PerformanceReviewCreate, PerformanceReviewUpdate, PerformanceReviewOut,
    PerformanceGoalCreate, PerformanceGoalUpdate, PerformanceGoalOut,
    PerformanceFeedbackCreate, PerformanceFeedbackUpdate, PerformanceFeedbackOut,
    KPICreate, KPIUpdate, KPIOut,
    EmployeeKPICreate, EmployeeKPIUpdate, EmployeeKPIOut,
)
import crud

router = APIRouter(tags=["Performance"])


# ── Performance Reviews ──────────────────────────────────────────────────────

@router.get("/performance-reviews", summary="List performance reviews")
def list_performance_reviews(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if status:
        filters["status"] = status
    return crud.list_records("performance_reviews", limit=limit, offset=offset, order_by="review_id", filters=filters or None)


@router.get("/performance-reviews/{review_id}", summary="Get performance review by ID")
def get_performance_review(review_id: int):
    return crud.get_record("performance_reviews", "review_id", review_id)


@router.post("/performance-reviews", status_code=201, summary="Create performance review")
def create_performance_review(body: PerformanceReviewCreate):
    return crud.create_record("performance_reviews", body.model_dump())


@router.put("/performance-reviews/{review_id}", summary="Update performance review")
def update_performance_review(review_id: int, body: PerformanceReviewUpdate):
    return crud.update_record("performance_reviews", "review_id", review_id, body.model_dump(exclude_unset=True))


@router.delete("/performance-reviews/{review_id}", summary="Delete performance review")
def delete_performance_review(review_id: int):
    return crud.delete_record("performance_reviews", "review_id", review_id)


# ── Performance Goals ────────────────────────────────────────────────────────

@router.get("/performance-goals", summary="List performance goals")
def list_performance_goals(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if status:
        filters["status"] = status
    return crud.list_records("performance_goals", limit=limit, offset=offset, order_by="goal_id", filters=filters or None)


@router.get("/performance-goals/{goal_id}", summary="Get performance goal by ID")
def get_performance_goal(goal_id: int):
    return crud.get_record("performance_goals", "goal_id", goal_id)


@router.post("/performance-goals", status_code=201, summary="Create performance goal")
def create_performance_goal(body: PerformanceGoalCreate):
    return crud.create_record("performance_goals", body.model_dump())


@router.put("/performance-goals/{goal_id}", summary="Update performance goal")
def update_performance_goal(goal_id: int, body: PerformanceGoalUpdate):
    return crud.update_record("performance_goals", "goal_id", goal_id, body.model_dump(exclude_unset=True))


@router.delete("/performance-goals/{goal_id}", summary="Delete performance goal")
def delete_performance_goal(goal_id: int):
    return crud.delete_record("performance_goals", "goal_id", goal_id)


# ── Performance Feedback ────────────────────────────────────────────────────

@router.get("/performance-feedback", summary="List performance feedback")
def list_performance_feedback(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("performance_feedback", limit=limit, offset=offset, order_by="feedback_id", filters=filters)


@router.get("/performance-feedback/{feedback_id}", summary="Get performance feedback by ID")
def get_performance_feedback(feedback_id: int):
    return crud.get_record("performance_feedback", "feedback_id", feedback_id)


@router.post("/performance-feedback", status_code=201, summary="Create performance feedback")
def create_performance_feedback(body: PerformanceFeedbackCreate):
    return crud.create_record("performance_feedback", body.model_dump())


@router.put("/performance-feedback/{feedback_id}", summary="Update performance feedback")
def update_performance_feedback(feedback_id: int, body: PerformanceFeedbackUpdate):
    return crud.update_record("performance_feedback", "feedback_id", feedback_id, body.model_dump(exclude_unset=True))


@router.delete("/performance-feedback/{feedback_id}", summary="Delete performance feedback")
def delete_performance_feedback(feedback_id: int):
    return crud.delete_record("performance_feedback", "feedback_id", feedback_id)


# ── KPIs ─────────────────────────────────────────────────────────────────────

@router.get("/kpis", summary="List KPIs")
def list_kpis(limit: int = 100, offset: int = 0, department_id: Optional[int] = None):
    filters = {"department_id": department_id} if department_id else None
    return crud.list_records("kpis", limit=limit, offset=offset, order_by="kpi_id", filters=filters)


@router.get("/kpis/{kpi_id}", summary="Get KPI by ID")
def get_kpi(kpi_id: int):
    return crud.get_record("kpis", "kpi_id", kpi_id)


@router.post("/kpis", status_code=201, summary="Create KPI")
def create_kpi(body: KPICreate):
    return crud.create_record("kpis", body.model_dump())


@router.put("/kpis/{kpi_id}", summary="Update KPI")
def update_kpi(kpi_id: int, body: KPIUpdate):
    return crud.update_record("kpis", "kpi_id", kpi_id, body.model_dump(exclude_unset=True))


@router.delete("/kpis/{kpi_id}", summary="Delete KPI")
def delete_kpi(kpi_id: int):
    return crud.delete_record("kpis", "kpi_id", kpi_id)


# ── Employee KPIs ────────────────────────────────────────────────────────────

@router.get("/employee-kpis", summary="List employee KPIs")
def list_employee_kpis(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None, status: Optional[str] = None):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if status:
        filters["status"] = status
    return crud.list_records("employee_kpis", limit=limit, offset=offset, order_by="emp_kpi_id", filters=filters or None)


@router.get("/employee-kpis/{emp_kpi_id}", summary="Get employee KPI by ID")
def get_employee_kpi(emp_kpi_id: int):
    return crud.get_record("employee_kpis", "emp_kpi_id", emp_kpi_id)


@router.post("/employee-kpis", status_code=201, summary="Create employee KPI")
def create_employee_kpi(body: EmployeeKPICreate):
    return crud.create_record("employee_kpis", body.model_dump())


@router.put("/employee-kpis/{emp_kpi_id}", summary="Update employee KPI")
def update_employee_kpi(emp_kpi_id: int, body: EmployeeKPIUpdate):
    return crud.update_record("employee_kpis", "emp_kpi_id", emp_kpi_id, body.model_dump(exclude_unset=True))


@router.delete("/employee-kpis/{emp_kpi_id}", summary="Delete employee KPI")
def delete_employee_kpi(emp_kpi_id: int):
    return crud.delete_record("employee_kpis", "emp_kpi_id", emp_kpi_id)

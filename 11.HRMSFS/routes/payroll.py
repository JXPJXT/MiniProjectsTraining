"""
Routes for payroll_runs, payroll_payslips, payroll_components,
salary_history, allowance_types, employee_allowances.
"""

from fastapi import APIRouter, Query
from typing import Optional
from schemas.payroll import (
    PayrollRunCreate, PayrollRunUpdate, PayrollRunOut,
    PayslipCreate, PayslipUpdate, PayslipOut,
    PayrollComponentCreate, PayrollComponentUpdate, PayrollComponentOut,
    SalaryHistoryCreate, SalaryHistoryUpdate, SalaryHistoryOut,
    AllowanceTypeCreate, AllowanceTypeUpdate, AllowanceTypeOut,
    EmployeeAllowanceCreate, EmployeeAllowanceUpdate, EmployeeAllowanceOut,
)
import crud

router = APIRouter(tags=["Payroll"])


# ── Payroll Runs ─────────────────────────────────────────────────────────────

@router.get("/payroll-runs", summary="List payroll runs")
def list_payroll_runs(limit: int = 100, offset: int = 0, status: Optional[str] = None):
    filters = {"status": status} if status else None
    return crud.list_records("payroll_runs", limit=limit, offset=offset, order_by="run_id", filters=filters)


@router.get("/payroll-runs/{run_id}", summary="Get payroll run by ID")
def get_payroll_run(run_id: int):
    return crud.get_record("payroll_runs", "run_id", run_id)


@router.post("/payroll-runs", status_code=201, summary="Create payroll run")
def create_payroll_run(body: PayrollRunCreate):
    return crud.create_record("payroll_runs", body.model_dump())


@router.put("/payroll-runs/{run_id}", summary="Update payroll run")
def update_payroll_run(run_id: int, body: PayrollRunUpdate):
    return crud.update_record("payroll_runs", "run_id", run_id, body.model_dump(exclude_unset=True))


@router.delete("/payroll-runs/{run_id}", summary="Delete payroll run")
def delete_payroll_run(run_id: int):
    return crud.delete_record("payroll_runs", "run_id", run_id)


# ── Payslips ─────────────────────────────────────────────────────────────────

@router.get("/payslips", summary="List payslips")
def list_payslips(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None, run_id: Optional[int] = None):
    filters = {}
    if emp_id:
        filters["emp_id"] = emp_id
    if run_id:
        filters["run_id"] = run_id
    return crud.list_records("payroll_payslips", limit=limit, offset=offset, order_by="payslip_id", filters=filters or None)


@router.get("/payslips/{payslip_id}", summary="Get payslip by ID")
def get_payslip(payslip_id: int):
    return crud.get_record("payroll_payslips", "payslip_id", payslip_id)


@router.post("/payslips", status_code=201, summary="Create payslip")
def create_payslip(body: PayslipCreate):
    return crud.create_record("payroll_payslips", body.model_dump())


@router.put("/payslips/{payslip_id}", summary="Update payslip")
def update_payslip(payslip_id: int, body: PayslipUpdate):
    return crud.update_record("payroll_payslips", "payslip_id", payslip_id, body.model_dump(exclude_unset=True))


@router.delete("/payslips/{payslip_id}", summary="Delete payslip")
def delete_payslip(payslip_id: int):
    return crud.delete_record("payroll_payslips", "payslip_id", payslip_id)


# ── Payroll Components ──────────────────────────────────────────────────────

@router.get("/payroll-components", summary="List payroll components")
def list_payroll_components(limit: int = 100, offset: int = 0, payslip_id: Optional[int] = None):
    filters = {"payslip_id": payslip_id} if payslip_id else None
    return crud.list_records("payroll_components", limit=limit, offset=offset, filters=filters)


@router.get("/payroll-components/{component_id}", summary="Get payroll component by ID")
def get_payroll_component(component_id: int):
    return crud.get_record("payroll_components", "component_id", component_id)


@router.post("/payroll-components", status_code=201, summary="Create payroll component")
def create_payroll_component(body: PayrollComponentCreate):
    return crud.create_record("payroll_components", body.model_dump())


@router.put("/payroll-components/{component_id}", summary="Update payroll component")
def update_payroll_component(component_id: int, body: PayrollComponentUpdate):
    return crud.update_record("payroll_components", "component_id", component_id, body.model_dump(exclude_unset=True))


@router.delete("/payroll-components/{component_id}", summary="Delete payroll component")
def delete_payroll_component(component_id: int):
    return crud.delete_record("payroll_components", "component_id", component_id)


# ── Salary History ───────────────────────────────────────────────────────────

@router.get("/salary-history", summary="List salary history")
def list_salary_history(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("salary_history", limit=limit, offset=offset, order_by="id", filters=filters)


@router.get("/salary-history/{id}", summary="Get salary history entry")
def get_salary_history(id: int):
    return crud.get_record("salary_history", "id", id)


@router.post("/salary-history", status_code=201, summary="Create salary history entry")
def create_salary_history(body: SalaryHistoryCreate):
    return crud.create_record("salary_history", body.model_dump())


@router.put("/salary-history/{id}", summary="Update salary history entry")
def update_salary_history(id: int, body: SalaryHistoryUpdate):
    return crud.update_record("salary_history", "id", id, body.model_dump(exclude_unset=True))


@router.delete("/salary-history/{id}", summary="Delete salary history entry")
def delete_salary_history(id: int):
    return crud.delete_record("salary_history", "id", id)


# ── Allowance Types ─────────────────────────────────────────────────────────

@router.get("/allowance-types", summary="List allowance types")
def list_allowance_types(limit: int = 100, offset: int = 0):
    return crud.list_records("allowance_types", limit=limit, offset=offset, order_by="allowance_type_id")


@router.get("/allowance-types/{allowance_type_id}", summary="Get allowance type by ID")
def get_allowance_type(allowance_type_id: int):
    return crud.get_record("allowance_types", "allowance_type_id", allowance_type_id)


@router.post("/allowance-types", status_code=201, summary="Create allowance type")
def create_allowance_type(body: AllowanceTypeCreate):
    return crud.create_record("allowance_types", body.model_dump())


@router.put("/allowance-types/{allowance_type_id}", summary="Update allowance type")
def update_allowance_type(allowance_type_id: int, body: AllowanceTypeUpdate):
    return crud.update_record("allowance_types", "allowance_type_id", allowance_type_id, body.model_dump(exclude_unset=True))


@router.delete("/allowance-types/{allowance_type_id}", summary="Delete allowance type")
def delete_allowance_type(allowance_type_id: int):
    return crud.delete_record("allowance_types", "allowance_type_id", allowance_type_id)


# ── Employee Allowances ─────────────────────────────────────────────────────

@router.get("/employee-allowances", summary="List employee allowances")
def list_employee_allowances(limit: int = 100, offset: int = 0, emp_id: Optional[int] = None):
    filters = {"emp_id": emp_id} if emp_id else None
    return crud.list_records("employee_allowances", limit=limit, offset=offset, filters=filters)


@router.get("/employee-allowances/{emp_allowance_id}", summary="Get employee allowance by ID")
def get_employee_allowance(emp_allowance_id: int):
    return crud.get_record("employee_allowances", "emp_allowance_id", emp_allowance_id)


@router.post("/employee-allowances", status_code=201, summary="Create employee allowance")
def create_employee_allowance(body: EmployeeAllowanceCreate):
    return crud.create_record("employee_allowances", body.model_dump())


@router.put("/employee-allowances/{emp_allowance_id}", summary="Update employee allowance")
def update_employee_allowance(emp_allowance_id: int, body: EmployeeAllowanceUpdate):
    return crud.update_record("employee_allowances", "emp_allowance_id", emp_allowance_id, body.model_dump(exclude_unset=True))


@router.delete("/employee-allowances/{emp_allowance_id}", summary="Delete employee allowance")
def delete_employee_allowance(emp_allowance_id: int):
    return crud.delete_record("employee_allowances", "emp_allowance_id", emp_allowance_id)

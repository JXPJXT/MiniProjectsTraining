"""Admin dashboard API — aggregated stats, dashboard data."""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.deps import require_roles, CurrentUser
from app.core.database import get_supabase_admin
from app.users.service import get_user_stats
from app.audit.service import get_audit_logs

router = APIRouter(prefix="/admin", tags=["Admin Panel"])


@router.get("/dashboard")
async def dashboard(
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    """Get admin dashboard stats."""
    db = get_supabase_admin()

    # User stats
    user_stats = await get_user_stats()

    # Drive stats
    drives = db.table("placement_drives").select("status").execute()
    drive_stats = {"open": 0, "closed": 0, "cancelled": 0, "total": 0}
    for d in (drives.data or []):
        s = d.get("status", "open")
        drive_stats[s] = drive_stats.get(s, 0) + 1
        drive_stats["total"] += 1

    # Document verification stats
    verifications = db.table("document_verifications").select("soft_skill_status, technical_status").execute()
    doc_stats = {"pending": 0, "approved": 0, "rejected": 0}
    for v in (verifications.data or []):
        if v.get("soft_skill_status") == "pending" or v.get("technical_status") == "pending":
            doc_stats["pending"] += 1
        elif v.get("soft_skill_status") == "approved" and v.get("technical_status") == "approved":
            doc_stats["approved"] += 1
        else:
            doc_stats["rejected"] += 1

    # Student placement stats
    student_drives = db.table("student_drive_map").select("selected, offer_status").execute()
    placement_stats = {"registered": len(student_drives.data or []), "selected": 0, "offers_accepted": 0, "offers_rejected": 0}
    for sd in (student_drives.data or []):
        if sd.get("selected"):
            placement_stats["selected"] += 1
        if sd.get("offer_status") == "accepted":
            placement_stats["offers_accepted"] += 1
        elif sd.get("offer_status") == "rejected":
            placement_stats["offers_rejected"] += 1

    # Recent audit logs
    recent_logs = await get_audit_logs(limit=10)

    return {
        "user_stats": user_stats,
        "drive_stats": drive_stats,
        "document_stats": doc_stats,
        "placement_stats": placement_stats,
        "recent_audit_logs": recent_logs,
    }


@router.get("/placement-report")
async def placement_report(
    stream: Optional[str] = None,
    batch_year: Optional[int] = None,
    current_user: CurrentUser = Depends(require_roles(["admin", "super_admin", "tpc"])),
):
    """Generate placement report."""
    db = get_supabase_admin()

    query = db.table("students").select("*, student_drive_map(*), placement_profiles(*)")
    if stream:
        query = query.eq("stream", stream)
    if batch_year:
        query = query.eq("batch_end_year", batch_year)

    result = query.execute()
    students = result.data or []

    report = {
        "total_students": len(students),
        "placed": 0,
        "unplaced": 0,
        "offers_accepted": 0,
        "students": [],
    }

    for s in students:
        drives = s.get("student_drive_map", [])
        is_placed = any(d.get("selected") and d.get("offer_status") == "accepted" for d in drives)
        if is_placed:
            report["placed"] += 1
            report["offers_accepted"] += 1
        else:
            report["unplaced"] += 1

        report["students"].append({
            "student_id": s["student_id"],
            "full_name": s["full_name"],
            "reg_no": s.get("reg_no"),
            "stream": s.get("stream"),
            "cgpa": s.get("cgpa"),
            "is_placed": is_placed,
            "drive_count": len(drives),
        })

    return report

"""Document schemas."""

from pydantic import BaseModel
from typing import Optional


class DocumentVerifyRequest(BaseModel):
    soft_skill_status: Optional[str] = None
    technical_status: Optional[str] = None
    remarks: Optional[str] = None


class DocumentResponse(BaseModel):
    id: int
    student_id: int
    document_type: str
    file_path: str
    uploaded_at: Optional[str] = None
    uploaded_by: Optional[str] = None

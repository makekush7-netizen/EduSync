from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from models.submission import SubmissionType

class HomeworkCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    allowed_types: List[str] = ["text", "pdf", "image"]

class HomeworkResponse(BaseModel):
    id: str
    course_id: str
    assigned_by: str
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    allowed_types: List[str]
    submission_count: Optional[int] = 0
    submitted: Optional[bool] = False

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: str
    homework_id: str
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    content_type: SubmissionType
    content_text: Optional[str] = None
    content_url: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

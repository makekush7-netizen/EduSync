from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.enrollment import EnrollmentStatus

class EnrollmentResponse(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    course_id: str
    course_title: Optional[str] = None
    status: EnrollmentStatus
    requested_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

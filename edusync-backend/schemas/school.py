from pydantic import BaseModel
from typing import Optional

class SchoolCreate(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

class TeacherInvite(BaseModel):
    email: str

class SchoolJoin(BaseModel):
    invite_code: str

class SchoolResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    invite_code: Optional[str] = None
    admin_id: str
    teacher_count: Optional[int] = 0
    teachers: list = []

    class Config:
        from_attributes = True

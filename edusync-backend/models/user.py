import uuid
import enum
from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    school_id = Column(String, ForeignKey("schools.id", ondelete="SET NULL"), nullable=True)

    __mapper_args__ = {
        "polymorphic_on": role,
        "polymorphic_identity": "user"
    }

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role.value,
            "school_id": self.school_id
        }

class Admin(User):
    __mapper_args__ = {"polymorphic_identity": UserRole.admin}
    
    # Relationships
    school = relationship("School", back_populates="admin", uselist=False, foreign_keys="[School.admin_id]")

class Teacher(User):
    __mapper_args__ = {"polymorphic_identity": UserRole.teacher}
    
    # Relationships
    courses = relationship("Course", back_populates="teacher", foreign_keys="[Course.teacher_id]")

class Student(User):
    __mapper_args__ = {"polymorphic_identity": UserRole.student}
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="[Enrollment.student_id]")
    submissions = relationship("Submission", back_populates="student", foreign_keys="[Submission.student_id]")
    chat_sessions = relationship("ChatSession", back_populates="student", foreign_keys="[ChatSession.student_id]")

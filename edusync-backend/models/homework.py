import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base, JSONEncodedDict

class Homework(Base):
    __tablename__ = "homeworks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    assigned_by = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    allowed_types = Column(JSONEncodedDict, default=["text", "pdf", "image"])

    course = relationship("Course", back_populates="homeworks")
    submissions = relationship("Submission", back_populates="homework", cascade="all, delete-orphan")

import uuid
import random
import string
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class School(Base):
    __tablename__ = "schools"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    invite_code = Column(String, unique=True, index=True, default=generate_invite_code)
    admin_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    admin = relationship("Admin", back_populates="school", foreign_keys=[admin_id])
    courses = relationship("Course", back_populates="school", cascade="all, delete-orphan")
    users = relationship("User", foreign_keys="[User.school_id]", viewonly=True)

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlalchemy.types as types
import json
from config import settings

database_url = settings.get_database_url()
engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class JSONEncodedDict(types.TypeDecorator):
    impl = types.String

    def process_bind_param(self, value, dialect):
        if value is None:
            return '[]'
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if not value:
            return []
        return json.loads(value)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

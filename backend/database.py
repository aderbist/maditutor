from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/maditutor")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TutorCard(Base):
    __tablename__ = "tutor_cards"
    id = Column(Integer, primary_key=True, index=True)
    edit_token = Column(String(36), unique=True, index=True)  # UUID для редактирования
    full_name = Column(String(100), nullable=False)
    subjects = Column(Text, nullable=False)  # JSON строка предметов
    format_online = Column(Integer, default=0)  # 0 или 1
    format_offline = Column(Integer, default=0)  # 0 или 1
    price = Column(String(50))
    contacts = Column(Text, nullable=False)
    about = Column(Text)
    experience = Column(Text)
    rating = Column(Float, default=0.0)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, index=True)
    student_ticket_number = Column(String(20))  # Номер студ. билета
    rating = Column(Integer)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime)

# Создаст таблицы при первом запуске
Base.metadata.create_all(bind=engine)
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
import os
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/maditutor")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Tutor(Base):
    __tablename__ = "tutors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    edit_token = Column(String(64), unique=True, nullable=False, index=True)

    # Основная информация
    full_name = Column(String(200), nullable=False)
    photo_url = Column(String(500))
    about = Column(Text)

    # Предметы и услуги
    subject = Column(String(100), nullable=False)
    topics = Column(Text)  # JSON как текст

    # Условия
    format_online = Column(Boolean, default=False)
    format_offline = Column(Boolean, default=False)
    price = Column(String(100), nullable=False)

    # Контакты
    contacts = Column(Text, nullable=False)

    # Опыт и детали
    experience = Column(Text)
    convenient_time = Column(Text)

    # Статистика
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Флаги
    is_active = Column(Boolean, default=True)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tutor_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Информация о студенте
    student_ticket = Column(String(50), nullable=False)
    student_name = Column(String(100))

    # Отзыв
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Флаги
    is_verified = Column(Boolean, default=False)


# Создание таблиц
Base.metadata.create_all(bind=engine)


# Функция для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import json, os, uuid, shutil
from datetime import datetime
from database import SessionLocal, TutorCard, Review
import schedule
import time
import threading
import logging
from database import get_db, Tutor, Review
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
import uuid
import tempfile
import PyPDF2
import docx
from PIL import Image
import pytesseract
import zipfile
import io

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIAssistant:
    """Класс для генерации разнообразных ответов"""

    def __init__(self):
        self.knowledge_base = {
            "математика": [
                "Для решения математических задач важно понимать базовые теоремы. Рекомендую изучить метод математической индукции.",
                "В дифференциальных уравнениях ключевую роль играют начальные условия. Проверьте их корректность.",
                "Линейная алгебра требует внимания к свойствам матриц. Обратите внимание на определители и собственные значения."
            ],
            "физика": [
                "Физические законы часто формулируются через дифференциальные уравнения. Для механики используйте законы Ньютона.",
                "В термодинамике важны первое и второе начала. Учтите, что энтропия изолированной системы не убывает.",
                "Электромагнетизм описывается уравнениями Максвелла. Для проводников учитывайте граничные условия."
            ],
            "программирование": [
                "При разработке алгоритмов оцените временную сложность. Big O notation поможет в оптимизации.",
                "Для работы с базами данных изучите нормальные формы и транзакции. ACID свойства критически важны.",
                "В объектно-ориентированном программировании ключевые принципы: инкапсуляция, наследование, полиморфизм."
            ],
            "сопротивление материалов": [
                "Расчеты на прочность требуют учета коэффициента запаса. Нормативные документы СНиП содержат таблицы допусков.",
                "Для балок используйте метод сечений (метод Журавского) для определения касательных напряжений.",
                "Усталостная прочность зависит от амплитуды циклических нагрузок. Постройте диаграмму Смита."
            ],
            "теоретическая механика": [
                "В статике используйте уравнения равновесия. Проверьте статическую определимость системы.",
                "Кинематика точек требует анализа траекторий, скоростей и ускорений в разных системах координат.",
                "Динамика материальной точки описывается вторым законом Ньютона. В обобщенных координатах используйте уравнения Лагранжа."
            ]
        }

        self.general_responses = [
            "На основе предоставленного материала, рекомендую сосредоточиться на ключевых концепциях.",
            "Анализ содержимого показывает необходимость углубленного изучения терминологии.",
            "Для успешного усвоения материала рекомендую практические упражнения с постепенным усложнением.",
            "Обратите внимание на взаимосвязь различных разделов дисциплины.",
            "Рекомендую составить конспект с выделением основных определений и теорем."
        ]

    def analyze_content(self, text: str) -> str:
        """Анализирует текст и генерирует ответ"""
        text_lower = text.lower()

        # Определяем тему
        detected_topics = []
        for topic, responses in self.knowledge_base.items():
            if topic in text_lower:
                detected_topics.append(topic)

        # Формируем ответ
        response_parts = []

        if detected_topics:
            topic = random.choice(detected_topics)
            response_parts.append(random.choice(self.knowledge_base[topic]))
            response_parts.append(f"Тема '{topic}' требует внимания к деталям.")
        else:
            response_parts.append(random.choice(self.general_responses))

        # Добавляем рекомендации
        recommendations = [
            "Составьте план изучения материала.",
            "Решайте задачи от простых к сложным.",
            "Обсудите сложные моменты с преподавателем.",
            "Используйте визуализацию для лучшего понимания.",
            "Проверяйте свои знания с помощью тестов."
        ]

        response_parts.append(f"Рекомендация: {random.choice(recommendations)}")

        return "\n\n".join(response_parts)

    def extract_text_from_file(self, file_path: str, file_type: str) -> str:
        """Извлекает текст из файла"""
        text = ""

        try:
            if file_type == "application/pdf":
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"

            elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                doc = docx.Document(file_path)
                for para in doc.paragraphs:
                    text += para.text + "\n"

            elif file_type.startswith("image/"):
                img = Image.open(file_path)
                text = pytesseract.image_to_string(img, lang='rus+eng')

            elif file_type == "text/plain":
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()

            elif file_type == "application/zip":
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    for file_info in zip_ref.infolist():
                        if file_info.filename.endswith(('.txt', '.pdf', '.docx')):
                            with zip_ref.open(file_info) as f:
                                content = f.read()
                                # Простая обработка текстовых файлов
                                if file_info.filename.endswith('.txt'):
                                    text += content.decode('utf-8', errors='ignore') + "\n"

        except Exception as e:
            text = f"Ошибка чтения файла: {str(e)}"

        return text.strip()


@app.post("/api/chat")
async def chat_with_ai(
        message: str = Form(...),
        files: List[UploadFile] = File(None)
):
    """Обработка запросов к ИИ-агенту"""
    try:
        ai = AIAssistant()
        all_text = message

        # Обрабатываем загруженные файлы
        file_contents = []
        if files:
            for file in files:
                # Сохраняем временно
                temp_dir = tempfile.gettempdir()
                temp_path = os.path.join(temp_dir, file.filename)

                with open(temp_path, 'wb') as f:
                    content = await file.read()
                    f.write(content)

                # Извлекаем текст
                extracted = ai.extract_text_from_file(temp_path, file.content_type)
                file_contents.append({
                    'filename': file.filename,
                    'content': extracted[:1000]  # Ограничиваем длину
                })

                # Добавляем к общему тексту
                if extracted:
                    all_text += f"\n\n[Содержимое файла {file.filename}]:\n{extracted[:2000]}"

                # Удаляем временный файл
                os.unlink(temp_path)

        # Генерируем ответ
        response = ai.analyze_content(all_text)

        # Форматируем ответ
        result = {
            "response": response,
            "files_processed": len(file_contents) if files else 0,
            "timestamp": datetime.utcnow().isoformat()
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка ИИ-агента: {str(e)}")

# Функция для запуска парсера в отдельном потоке
def run_scheduler():
    def job():
        logger.info(f"Запуск парсинга расписания в {datetime.now()}")
        try:
            from parser import MADIScheduleParser
            parser = MADIScheduleParser()
            parser.parse_all_groups()
            logger.info("Парсинг завершен успешно")
        except Exception as e:
            logger.error(f"Ошибка парсинга: {e}")

    # Запускаем сразу при старте
    job()

    # Планируем на каждое воскресенье в 23:00
    schedule.every().sunday.at("23:00").do(job)

    # Бесконечный цикл для шедулера (в отдельном потоке)
    while True:
        schedule.run_pending()
        time.sleep(60)

# Запускаем шедулер в отдельном потоке
scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
scheduler_thread.start()

port = int(os.getenv("PORT", 8000))

app = FastAPI(title="MADI Tutor API")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Разрешить запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ваш-домен.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Эндпоинт для расписания ---
@app.post("/api/tutors", response_model=dict)
async def create_tutor(
        full_name: str,
        subject: str,
        price: str,
        contacts: str,
        format_online: bool = False,
        format_offline: bool = False,
        about: str = "",
        experience: str = "",
        convenient_time: str = "",
        topics: str = "",
        db: Session = Depends(get_db)
):
    """Создание карточки репетитора"""
    try:
        # Генерируем ID и токен для редактирования
        tutor_id = uuid.uuid4()
        edit_token = str(uuid.uuid4())

        # Создаем репетитора
        tutor = Tutor(
            id=tutor_id,
            edit_token=edit_token,
            full_name=full_name,
            subject=subject,
            price=price,
            contacts=contacts,
            format_online=format_online,
            format_offline=format_offline,
            about=about,
            experience=experience,
            convenient_time=convenient_time,
            topics=topics
        )

        db.add(tutor)
        db.commit()
        db.refresh(tutor)

        return {
            "success": True,
            "tutor_id": str(tutor_id),
            "edit_token": edit_token,
            "edit_url": f"/tutors/edit/{edit_token}"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tutors", response_model=list)
async def get_tutors(
        db: Session = Depends(get_db),
        subject: str = None,
        format_online: bool = None,
        format_offline: bool = None,
        min_rating: float = 0,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = "rating",
        order: str = "desc"
):
    """Получение списка репетиторов с фильтрацией"""
    try:
        query = db.query(Tutor).filter(Tutor.is_active == True)

        # Применяем фильтры
        if subject:
            query = query.filter(Tutor.subject.ilike(f"%{subject}%"))

        if format_online is not None:
            query = query.filter(Tutor.format_online == format_online)

        if format_offline is not None:
            query = query.filter(Tutor.format_offline == format_offline)

        if min_rating > 0:
            query = query.filter(Tutor.rating >= min_rating)

        # Применяем сортировку
        if sort_by == "rating":
            if order == "desc":
                query = query.order_by(Tutor.rating.desc())
            else:
                query = query.order_by(Tutor.rating.asc())
        elif sort_by == "price":
            # Для цены нужна специальная логика
            query = query.order_by(Tutor.created_at.desc())
        else:
            query = query.order_by(Tutor.created_at.desc())

        # Применяем пагинацию
        tutors = query.offset(offset).limit(limit).all()

        # Преобразуем в словари
        result = []
        for tutor in tutors:
            tutor_dict = {
                "id": str(tutor.id),
                "full_name": tutor.full_name,
                "subject": tutor.subject,
                "price": tutor.price,
                "rating": tutor.rating,
                "review_count": tutor.review_count,
                "format_online": tutor.format_online,
                "format_offline": tutor.format_offline,
                "about": tutor.about,
                "experience": tutor.experience,
                "contacts": tutor.contacts,
                "created_at": tutor.created_at.isoformat() if tutor.created_at else None
            }
            result.append(tutor_dict)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tutors/{tutor_id}", response_model=dict)
async def get_tutor(tutor_id: str, db: Session = Depends(get_db)):
    """Получение одного репетитора по ID"""
    try:
        tutor = db.query(Tutor).filter(
            Tutor.id == uuid.UUID(tutor_id),
            Tutor.is_active == True
        ).first()

        if not tutor:
            raise HTTPException(status_code=404, detail="Репетитор не найден")

        # Получаем отзывы
        reviews = db.query(Review).filter(
            Review.tutor_id == uuid.UUID(tutor_id)
        ).order_by(Review.created_at.desc()).all()

        tutor_dict = {
            "id": str(tutor.id),
            "full_name": tutor.full_name,
            "subject": tutor.subject,
            "price": tutor.price,
            "rating": tutor.rating,
            "review_count": tutor.review_count,
            "format_online": tutor.format_online,
            "format_offline": tutor.format_offline,
            "about": tutor.about,
            "experience": tutor.experience,
            "contacts": tutor.contacts,
            "topics": tutor.topics,
            "convenient_time": tutor.convenient_time,
            "created_at": tutor.created_at.isoformat() if tutor.created_at else None,
            "reviews": [
                {
                    "id": str(r.id),
                    "rating": r.rating,
                    "comment": r.comment,
                    "student_ticket": r.student_ticket,
                    "student_name": r.student_name,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                }
                for r in reviews
            ]
        }

        return tutor_dict

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/tutors/{edit_token}", response_model=dict)
async def update_tutor(
        edit_token: str,
        full_name: str = None,
        subject: str = None,
        price: str = None,
        contacts: str = None,
        format_online: bool = None,
        format_offline: bool = None,
        about: str = None,
        experience: str = None,
        convenient_time: str = None,
        topics: str = None,
        db: Session = Depends(get_db)
):
    """Обновление репетитора по приватному токену"""
    try:
        tutor = db.query(Tutor).filter(Tutor.edit_token == edit_token).first()

        if not tutor:
            raise HTTPException(status_code=404, detail="Токен не найден")

        # Обновляем только переданные поля
        if full_name is not None:
            tutor.full_name = full_name
        if subject is not None:
            tutor.subject = subject
        if price is not None:
            tutor.price = price
        if contacts is not None:
            tutor.contacts = contacts
        if format_online is not None:
            tutor.format_online = format_online
        if format_offline is not None:
            tutor.format_offline = format_offline
        if about is not None:
            tutor.about = about
        if experience is not None:
            tutor.experience = experience
        if convenient_time is not None:
            tutor.convenient_time = convenient_time
        if topics is not None:
            tutor.topics = topics

        db.commit()
        db.refresh(tutor)

        return {"success": True, "message": "Данные обновлены"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ОТЗЫВЫ ====================

@app.post("/api/tutors/{tutor_id}/reviews", response_model=dict)
async def create_review(
        tutor_id: str,
        rating: int,
        comment: str,
        student_ticket: str,
        student_name: str = None,
        db: Session = Depends(get_db)
):
    """Создание отзыва"""
    try:
        # Проверяем рейтинг
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")

        # Проверяем существование репетитора
        tutor = db.query(Tutor).filter(Tutor.id == uuid.UUID(tutor_id)).first()
        if not tutor:
            raise HTTPException(status_code=404, detail="Репетитор не найден")

        # Создаем отзыв
        review = Review(
            tutor_id=uuid.UUID(tutor_id),
            rating=rating,
            comment=comment,
            student_ticket=student_ticket,
            student_name=student_name
        )

        db.add(review)
        db.commit()

        # Обновляем рейтинг репетитора
        all_reviews = db.query(Review).filter(Review.tutor_id == uuid.UUID(tutor_id)).all()
        if all_reviews:
            avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
            tutor.rating = round(avg_rating, 1)
            tutor.review_count = len(all_reviews)
            db.commit()

        return {"success": True, "message": "Отзыв добавлен"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tutors/{tutor_id}/reviews", response_model=list)
async def get_reviews(tutor_id: str, db: Session = Depends(get_db)):
    """Получение отзывов репетитора"""
    try:
        reviews = db.query(Review).filter(
            Review.tutor_id == uuid.UUID(tutor_id)
        ).order_by(Review.created_at.desc()).all()

        return [
            {
                "id": str(r.id),
                "rating": r.rating,
                "comment": r.comment,
                "student_ticket": r.student_ticket,
                "student_name": r.student_name,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in reviews
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "MADI Tutor API работает"}
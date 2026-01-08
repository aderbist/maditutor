from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import json, os, uuid, shutil
from datetime import datetime
from database import SessionLocal, TutorCard, Review

app = FastAPI(title="MADI Tutor API")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Разрешить запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://maditutor-frontend.onrender.com/"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Эндпоинт для расписания ---
@app.get("/api/schedule/{week_type}")
async def get_schedule(week_type: str):  # week_type = "numerator" или "denominator"
    file_path = f"static/schedule_{week_type}.json"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Schedule not found")
    with open(file_path, "r", encoding="utf-8") as f:
        return JSONResponse(content=json.load(f))

# --- Эндпоинт для создания карточки репетитора ---
@app.post("/api/tutors")
async def create_tutor(
    full_name: str = Form(...),
    subjects: str = Form(...),
    contacts: str = Form(...)
):
    db = SessionLocal()
    edit_token = str(uuid.uuid4())  # Генерируем уникальный токен для редактирования
    new_tutor = TutorCard(
        edit_token=edit_token,
        full_name=full_name,
        subjects=subjects,
        contacts=contacts,
        rating=0.0
    )
    db.add(new_tutor)
    db.commit()
    db.refresh(new_tutor)
    db.close()
    return {"tutor_id": new_tutor.id, "edit_token": edit_token}

# --- Эндпоинт для получения всех репетиторов (для каталога) ---
@app.get("/api/tutors")
async def get_tutors():
    db = SessionLocal()
    tutors = db.query(TutorCard).all()
    db.close()
    return tutors

# --- Эндпоинт для чата с ИИ ---
@app.post("/api/chat")
async def chat_with_ai(message: str = Form(...), files: list[UploadFile] = File(None)):
    # 1. Сохраняем файлы временно
    file_paths = []
    if files:
        for file in files:
            file_path = f"temp_uploads/{uuid.uuid4()}_{file.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(file_path)
    
    # 2. Заглушка для ответа ИИ
    ai_response = f"Вы сказали: '{message}'. В демо-версии ИИ-агент имитирует ответ. "
    if file_paths:
        ai_response += f"Загружено файлов: {len(file_paths)}."
    
    # 3. Удаляем файлы после обработки (имитация)
    for fp in file_paths:
        if os.path.exists(fp):
            os.remove(fp)
            
    return {"response": ai_response}

@app.get("/")
async def root():
    return {"message": "MADI Tutor API работает"}
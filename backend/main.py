from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI(
    title="MADI Tutor Schedule API",
    description="API для расписания занятий МАДИ",
    version="2.0.0"
)

# Разрешить все CORS запросы
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_schedule(week_type: str):
    """Загружает JSON файл с расписанием"""
    try:
        # Определяем путь к файлу
        if week_type == "numerator":
            filepath = "schedule_numerator.json"
        elif week_type == "denominator":
            filepath = "schedule_denominator.json"
        else:
            return None
            
        # В Render файлы в корне папки static
        full_path = f"static/{filepath}"
        
        # Проверяем существует ли файл
        if not os.path.exists(full_path):
            print(f"Файл не найден: {full_path}")
            return None
            
        # Читаем файл
        with open(full_path, "r", encoding="utf-8") as f:
            return json.load(f)
            
    except Exception as e:
        print(f"Ошибка загрузки расписания: {e}")
        return None

@app.get("/api/schedule/{week_type}")
async def get_schedule(week_type: str):
    """
    Получить расписание для недели
    week_type: 'numerator' (числитель) или 'denominator' (знаменатель)
    """
    if week_type not in ["numerator", "denominator"]:
        raise HTTPException(
            status_code=400,
            detail="Неверный тип недели. Используйте 'numerator' или 'denominator'"
        )
    
    schedule_data = load_schedule(week_type)
    
    if not schedule_data:
        raise HTTPException(
            status_code=404,
            detail=f"Расписание для {week_type} не найдено"
        )
    
    return schedule_data

@app.get("/api/groups")
async def get_groups():
    """Получить список всех групп"""
    numerator = load_schedule("numerator")
    denominator = load_schedule("denominator")
    
    groups = set()
    
    if numerator:
        groups.update(numerator.keys())
    if denominator:
        groups.update(denominator.keys())
    
    return {"groups": sorted(list(groups))}

@app.get("/api/health")
async def health_check():
    """Проверка здоровья API"""
    return {
        "status": "healthy",
        "service": "MADI Schedule API",
        "version": "2.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "MADI Schedule API работает!",
        "endpoints": {
            "schedule": "/api/schedule/{numerator|denominator}",
            "groups": "/api/groups",
            "health": "/api/health"
        }
    }

# Для локального запуска
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
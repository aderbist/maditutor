from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import json, os
from typing import Dict, List, Any

app = FastAPI(
    title="MADI Tutor API",
    description="API для расписания МАДИ",
    version="1.0.0"
)

# Разрешить запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно заменить на конкретный домен фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

def load_schedule_file(filename: str) -> Dict[str, Any]:
    """Загружает JSON файл с расписанием"""
    try:
        file_path = f"static/{filename}"
        if not os.path.exists(file_path):
            return {}
        
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Ошибка загрузки файла {filename}: {e}")
        return {}

@app.get("/api/schedule/{week_type}")
async def get_schedule(week_type: str):
    """
    Возвращает расписание для указанного типа недели
    week_type: "numerator" (числитель) или "denominator" (знаменатель)
    """
    if week_type not in ["numerator", "denominator"]:
        raise HTTPException(
            status_code=400,
            detail="Неверный тип недели. Используйте 'numerator' или 'denominator'"
        )
    
    filename = f"schedule_{week_type}.json"
    schedule_data = load_schedule_file(filename)
    
    if not schedule_data:
        raise HTTPException(
            status_code=404,
            detail=f"Расписание для {week_type} не найдено"
        )
    
    return JSONResponse(content=schedule_data)

@app.get("/api/groups")
async def get_all_groups():
    """Возвращает список всех доступных групп"""
    numerator_data = load_schedule_file("schedule_numerator.json")
    denominator_data = load_schedule_file("schedule_denominator.json")
    
    # Объединяем группы из обоих файлов
    all_groups = set()
    all_groups.update(numerator_data.keys())
    all_groups.update(denominator_data.keys())
    
    return JSONResponse(content={"groups": sorted(list(all_groups))})

@app.get("/api/health")
async def health_check():
    """Проверка работоспособности API"""
    return {"status": "healthy", "service": "MADI Tutor API"}

@app.get("/")
async def root():
    return {
        "message": "MADI Tutor API работает",
        "endpoints": {
            "расписание": "/api/schedule/{numerator|denominator}",
            "все группы": "/api/groups",
            "статус": "/api/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
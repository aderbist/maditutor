from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI(
    title="MADI Tutor Schedule API",
    description="API для расписания МАДИ",
    version="3.0.0"
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
        # В Render файлы статики доступны через относительный путь
        if week_type == "numerator":
            filepath = "static/schedule_numerator.json"
        elif week_type == "denominator":
            filepath = "static/schedule_denominator.json"
        else:
            return None
            
        # Проверяем существует ли файл
        if not os.path.exists(filepath):
            # Пробуем альтернативный путь
            alt_path = os.path.join(os.path.dirname(__file__), filepath)
            if os.path.exists(alt_path):
                filepath = alt_path
            else:
                print(f"Файл не найден: {filepath}")
                return None
                
        # Читаем файл
        with open(filepath, "r", encoding="utf-8") as f:
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
        # Возвращаем тестовые данные если файл не найден
        test_data = {
            "1бАЭн1": {
                "Понедельник": [
                    {
                        "Время занятий": "09:55 - 11:25",
                        "Периодичность занятий": "Еженедельно",
                        "Аудитория": "242",
                        "Преподаватель": "Тестовый Преподаватель",
                        "Наименование дисциплины": "Тестовая дисциплина",
                        "Вид занятий": "Лекции"
                    }
                ]
            }
        }
        return test_data
    
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
    
    # Если нет групп, возвращаем тестовые
    if not groups:
        groups = {"1бАЭн1", "2бАЭн1", "3бАЭн1"}
    
    return {"groups": sorted(list(groups))}

@app.get("/api/health")
async def health_check():
    """Проверка здоровья API"""
    return {
        "status": "healthy",
        "service": "MADI Schedule API",
        "version": "3.0.0",
        "endpoints": {
            "schedule": "/api/schedule/{numerator|denominator}",
            "groups": "/api/groups"
        }
    }

@app.get("/")
async def root():
    return {
        "message": "MADI Schedule API работает! 🚀",
        "docs": {
            "get_schedule": "GET /api/schedule/{numerator|denominator}",
            "get_groups": "GET /api/groups",
            "health_check": "GET /api/health"
        }
    }

# Это важно для Render
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
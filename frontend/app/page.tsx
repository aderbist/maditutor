'use client'
import { useState, useEffect } from 'react'

interface Lesson {
  "Время занятий": string;
  "Периодичность занятий": string;
  "Аудитория": string;
  "Преподаватель": string;
  "Наименование дисциплины": string;
  "Вид занятий": string;
}

interface Schedule {
  [group: string]: {
    [day: string]: Lesson[];
  };
}

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [weekType, setWeekType] = useState<'numerator' | 'denominator'>('numerator')
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Константа с URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://maditutor-backend.onrender.com';

  // Загружаем список групп
  useEffect(() => {
    fetch(`${API_URL}/api/schedule/${weekType}`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      setSchedule(data.data);
    }
  });
  }, [])

  // Загрузка расписания при выборе группы
  useEffect(() => {
    if (!selectedGroup) {
      setSchedule(null)
      return
    }
    
    setLoading(true)
    fetch(`${API_URL}/api/schedule/${weekType}`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      setSchedule(data.data);
    }
  });
  }, [selectedGroup, weekType])

  // Для получения групп:
fetch(`${API_URL}/api/groups`)
  .then(res => res.json())
  .then(data => setGroups(data.groups));

  const daysOfWeek = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ]

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-center mb-4">MADI Tutor - Расписание</h1>
        <p className="text-text-secondary text-center">Расписание занятий для студентов МАДИ</p>
      </header>

      {/* Выбор группы */}
      <div className="mb-8 bg-card p-6 rounded-xl border border-gray-800">
        <label className="block text-lg font-medium mb-3">Выберите вашу группу:</label>
        <select 
          className="bg-gray-900 text-text-primary p-3 rounded-lg border border-gray-700 w-full max-w-md focus:ring-2 focus:ring-accent focus:outline-none transition"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">-- Выберите группу --</option>
          {groups.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      {/* Переключатель недели */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-all ${weekType === 'numerator' ? 'bg-accent text-white shadow-lg' : 'bg-card text-text-secondary hover:bg-gray-800'}`}
          onClick={() => setWeekType('numerator')}
        >
          Числитель
        </button>
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-all ${weekType === 'denominator' ? 'bg-accent text-white shadow-lg' : 'bg-card text-text-secondary hover:bg-gray-800'}`}
          onClick={() => setWeekType('denominator')}
        >
          Знаменатель
        </button>
      </div>

      {/* Информация о выбранной группе */}
      {selectedGroup && (
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
          <p className="text-lg">
            Группа: <span className="font-semibold text-accent">{selectedGroup}</span> | 
            Неделя: <span className="font-semibold">{weekType === 'numerator' ? 'Числитель' : 'Знаменатель'}</span>
          </p>
        </div>
      )}

      {/* Отображение расписания */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Загрузка расписания...</p>
        </div>
      ) : schedule && selectedGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map((day) => {
            const dayLessons = schedule[selectedGroup]?.[day] || []
            
            // Фильтруем занятия по периодичности
            const filteredLessons = dayLessons.filter((lesson) => {
              if (lesson["Периодичность занятий"] === "Еженедельно") return true
              if (weekType === 'numerator' && lesson["Периодичность занятий"] === "Числитель") return true
              if (weekType === 'denominator' && lesson["Периодичность занятий"] === "Знаменатель") return true
              return false
            })

            return (
              <div key={day} className="bg-card p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
                  <h3 className="text-xl font-semibold">{day}</h3>
                  <span className="text-sm text-text-secondary bg-gray-900 px-3 py-1 rounded-full">
                    {filteredLessons.length} занятий
                  </span>
                </div>
                
                {filteredLessons.length > 0 ? (
                  <div className="space-y-4">
                    {filteredLessons.map((lesson: Lesson, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-accent hover:bg-gray-800/50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-accent">{lesson["Время занятий"]}</span>
                          <span className="text-xs bg-gray-800 text-text-secondary px-2 py-1 rounded">
                            {lesson["Вид занятий"]}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-lg mb-1">{lesson["Наименование дисциплины"]}</h4>
                        
                        <div className="space-y-1 text-sm text-text-secondary mt-3">
                          {lesson["Преподаватель"] && (
                            <p className="flex items-center">
                              <span className="mr-2">👨‍🏫</span>
                              {lesson["Преподаватель"]}
                            </p>
                          )}
                          {lesson["Аудитория"] && (
                            <p className="flex items-center">
                              <span className="mr-2">🏫</span>
                              Аудитория: {lesson["Аудитория"]}
                            </p>
                          )}
                          {lesson["Периодичность занятий"] !== "Еженедельно" && (
                            <p className="text-xs text-yellow-500 mt-2">
                              {lesson["Периодичность занятий"]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Занятий нет</p>
                    <p className="text-sm text-gray-600 mt-1">Можно отдохнуть!</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : selectedGroup ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Расписание для выбранной группы не найдено</p>
        </div>
      ) : null}
    </main>
  )
}
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

// ⚠️ ВАЖНО: Замените этот URL на реальный URL вашего Node.js бэкенда на Render
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://madi-backend-node.onrender.com';

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [weekType, setWeekType] = useState<'numerator' | 'denominator'>('numerator')
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Загружаем список всех групп при первом рендере
  useEffect(() => {
    console.log('Загружаем список групп...');
    setError('');
    
    fetch(`${API_URL}/api/groups`)
      .then(res => {
        console.log('Ответ от /api/groups:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Получены группы:', data);
        
        // Проверяем разные форматы ответа
        if (data.groups && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else if (Array.isArray(data)) {
          setGroups(data);
        } else if (data.success && data.groups) {
          setGroups(data.groups);
        } else {
          console.error('Неожиданный формат данных:', data);
          setGroups([]);
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки групп:', err);
        setError(`Не удалось загрузить список групп: ${err.message}`);
        setGroups([]);
      });
  }, [])

  // Загрузка расписания при выборе группы
  useEffect(() => {
    if (!selectedGroup) {
      setSchedule(null);
      return;
    }
    
    console.log(`Загружаем расписание для группы ${selectedGroup}, неделя: ${weekType}`);
    setLoading(true);
    setError('');
    
    fetch(`${API_URL}/api/schedule/${weekType}`)
      .then(res => {
        console.log('Ответ от /api/schedule:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Получено расписание:', data);
        
        // Проверяем разные форматы ответа
        if (data && data[selectedGroup]) {
          // Формат: { "1бАЭн1": { "Понедельник": [...] } }
          setSchedule(data);
        } else if (data.data && data.data[selectedGroup]) {
          // Формат: { success: true, data: { "1бАЭн1": { ... } } }
          setSchedule(data.data);
        } else if (data.success && data.data && data.data[selectedGroup]) {
          setSchedule(data.data);
        } else {
          console.warn(`Расписание для группы ${selectedGroup} не найдено`);
          setSchedule(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки расписания:', err);
        setError(`Не удалось загрузить расписание: ${err.message}`);
        setLoading(false);
        setSchedule(null);
      });
  }, [selectedGroup, weekType])

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
        <p className="text-sm text-gray-500 text-center mt-2">
          API: {API_URL}
        </p>
      </header>

      {/* Показываем ошибку, если есть */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
          <p className="font-bold">Ошибка:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Проверьте консоль браузера (F12 → Console) для подробностей
          </p>
        </div>
      )}

      {/* Выбор группы */}
      <div className="mb-8 bg-card p-6 rounded-xl border border-gray-800">
        <label className="block text-lg font-medium mb-3">Выберите вашу группу:</label>
        <select 
          className="bg-gray-900 text-text-primary p-3 rounded-lg border border-gray-700 w-full max-w-md focus:ring-2 focus:ring-accent focus:outline-none transition"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">-- {groups.length > 0 ? 'Выберите группу' : 'Загрузка групп...'} --</option>
          {groups.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
        
        {/* Информация о группах */}
        <div className="mt-4 text-sm text-text-secondary">
          {groups.length > 0 ? (
            <p>Найдено групп: {groups.length}</p>
          ) : (
            <p>Группы не загружены. Проверьте подключение к бэкенду.</p>
          )}
        </div>
      </div>

      {/* Переключатель недели */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-all ${weekType === 'numerator' ? 'bg-accent text-white shadow-lg' : 'bg-card text-text-secondary hover:bg-gray-800'}`}
          onClick={() => setWeekType('numerator')}
          disabled={!selectedGroup}
        >
          Числитель
        </button>
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-all ${weekType === 'denominator' ? 'bg-accent text-white shadow-lg' : 'bg-card text-text-secondary hover:bg-gray-800'}`}
          onClick={() => setWeekType('denominator')}
          disabled={!selectedGroup}
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

      {/* Индикатор загрузки */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Загрузка расписания...</p>
        </div>
      )}

      {/* Отображение расписания */}
      {!loading && schedule && selectedGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {daysOfWeek.map((day) => {
            const dayLessons = schedule[selectedGroup]?.[day] || []
            
            // Фильтруем занятия по периодичности
            const filteredLessons = dayLessons.filter((lesson: Lesson) => {
              const period = lesson["Периодичность занятий"];
              if (period === "Еженедельно") return true;
              if (weekType === 'numerator' && period === "Числитель") return true;
              if (weekType === 'denominator' && period === "Знаменатель") return true;
              if (weekType === 'numerator' && period === "Числ.") return true;
              if (weekType === 'denominator' && period === "Знам.") return true;
              return false;
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
                          {lesson["Преподаватель"] && lesson["Преподаватель"].trim() && (
                            <p className="flex items-center">
                              <span className="mr-2">👨‍🏫</span>
                              {lesson["Преподаватель"]}
                            </p>
                          )}
                          {lesson["Аудитория"] && lesson["Аудитория"].trim() && (
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
      ) : selectedGroup && !loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Расписание для выбранной группы не найдено</p>
          <p className="text-sm text-gray-600 mt-2">
            Проверьте, есть ли группа "{selectedGroup}" в файлах schedule_numerator.json и schedule_denominator.json
          </p>
        </div>
      ) : null}
    </main>
  )
}
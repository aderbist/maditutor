'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [weekType, setWeekType] = useState<'numerator' | 'denominator'>('numerator')
  const [schedule, setSchedule] = useState<any>(null)

  // Загрузка расписания при выборе группы
  useEffect(() => {
    if (!selectedGroup) return
    fetch(`http://localhost:8000/api/schedule/${weekType}`)
      .then(res => res.json())
      .then(data => setSchedule(data[selectedGroup] || []))
  }, [selectedGroup, weekType])

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">MADI Tutor</h1>
      
      {/* Выбор группы */}
      <div className="mb-8">
        <label className="block text-lg mb-2">Выберите вашу группу:</label>
        <select 
          className="bg-card text-text-primary p-3 rounded-lg border border-gray-800 w-full max-w-xs"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">-- Не выбрано --</option>
          <option value="ИБ-201б">ИБ-201б</option>
          {/* Добавь другие группы */}
        </select>
      </div>

      {/* Переключатель недели */}
      <div className="flex gap-4 mb-8">
        <button 
          className={`px-6 py-2 rounded-lg ${weekType === 'numerator' ? 'bg-accent' : 'bg-card'}`}
          onClick={() => setWeekType('numerator')}
        >
          Числитель
        </button>
        <button 
          className={`px-6 py-2 rounded-lg ${weekType === 'denominator' ? 'bg-accent' : 'bg-card'}`}
          onClick={() => setWeekType('denominator')}
        >
          Знаменатель
        </button>
      </div>

      {/* Отображение расписания в карточках */}
      {schedule && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].map(day => {
            const dayLessons = schedule.filter((lesson: any) => lesson.day === day)
            return (
              <div key={day} className="bg-card p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold mb-4">{day}</h3>
                {dayLessons.length > 0 ? (
                  dayLessons.map((lesson: any, idx: number) => (
                    <div key={idx} className="mb-4 p-4 bg-gray-900/50 rounded-lg">
                      <p className="font-medium">{lesson.time}</p>
                      <p>{lesson.subject}</p>
                      <p className="text-text-secondary text-sm">{lesson.teacher} • {lesson.room}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary">Занятий нет</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
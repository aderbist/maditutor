'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [weekType, setWeekType] = useState<'numerator' | 'denominator'>('numerator')
  const [schedule, setSchedule] = useState<any[]>([])
  const [groups, setGroups] = useState<string[]>([])

  // Загружаем список групп при загрузке
  useEffect(() => {
    const mockGroups = ['ИБ-201б', 'АД-101а', 'ЭК-302в', 'ТР-204г']
    setGroups(mockGroups)
    
    // Проверяем, есть ли сохраненная группа в localStorage
    const savedGroup = localStorage.getItem('selectedGroup')
    if (savedGroup) {
      setSelectedGroup(savedGroup)
    }
  }, [])

  // Загрузка расписания при выборе группы
  useEffect(() => {
    if (!selectedGroup) {
      setSchedule([])
      return
    }
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedGroup', selectedGroup)
    
    // Имитация запроса к API
    //const mockSchedule = weekType === 'numerator' 
    //  ? [
    //      { day: 'Понедельник', time: '09:00-10:30', subject: 'Математический анализ', type: 'Лекция', teacher: 'Иванов А.П.', room: 'А-101' },
    //      { day: 'Понедельник', time: '10:40-12:10', subject: 'Физика', type: 'Практика', teacher: 'Петрова М.С.', room: 'Б-205' },
    //      { day: 'Вторник', time: '13:30-15:00', subject: 'Программирование', type: 'Лабораторная', teacher: 'Сидоров В.Г.', room: 'В-310' },
    //      { day: 'Среда', time: '14:00-15:30', subject: 'Иностранный язык', type: 'Практика', teacher: 'Козлова Е.Н.', room: 'Г-104' },
    //      { day: 'Четверг', time: '11:00-12:30', subject: 'Теоретическая механика', type: 'Лекция', teacher: 'Николаев П.В.', room: 'Д-105' }
    //    ]
    //  : [
    //      { day: 'Понедельник', time: '13:30-15:00', subject: 'Информатика', type: 'Практика', teacher: 'Смирнов О.Л.', room: 'А-201' },
    //      { day: 'Вторник', time: '09:00-10:30', subject: 'Математический анализ', type: 'Лекция', teacher: 'Иванов А.П.', room: 'Б-101' },
    //      { day: 'Пятница', time: '15:40-17:10', subject: 'Физкультура', type: 'Практика', teacher: 'Волков С.А.', room: 'Спортзал' }
    //    ]
    //
    //setSchedule(mockSchedule)
    
    // Для реального API раскомментируй:
    fetch(`https://maditutor-backend.onrender.com/api/schedule/${weekType}`)
      .then(res => res.json())
      .then(data => setSchedule(data[selectedGroup] || []))
  }, [selectedGroup, weekType])

  // Группируем занятия по дням
  const groupedSchedule = schedule.reduce((acc: any, lesson: any) => {
    if (!acc[lesson.day]) {
      acc[lesson.day] = []
    }
    acc[lesson.day].push(lesson)
    return acc
  }, {})

  // Порядок дней недели
  const daysOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">MADI Tutor</h1>
        
        {/* Выбор группы */}
        <div className="w-full md:w-auto">
          <label className="block text-text-secondary text-sm mb-2">Ваша учебная группа:</label>
          <select 
            className="bg-card text-text-primary p-3 rounded-lg border border-gray-800 w-full md:w-64"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- Выберите группу --</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedGroup ? (
        <>
          {/* Переключатель недели и информационная плашка */}
          <div className="bg-card p-4 rounded-xl border border-gray-800 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-text-primary">
                <span className="font-medium">Текущая неделя:</span> 
                <span className="ml-2 px-3 py-1 bg-accent/20 rounded-full">Числитель</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className={`px-6 py-2 rounded-lg transition-all ${weekType === 'numerator' ? 'bg-accent text-white' : 'bg-gray-900 text-text-secondary'}`}
                  onClick={() => setWeekType('numerator')}
                >
                  Числитель
                </button>
                <button 
                  className={`px-6 py-2 rounded-lg transition-all ${weekType === 'denominator' ? 'bg-accent text-white' : 'bg-gray-900 text-text-secondary'}`}
                  onClick={() => setWeekType('denominator')}
                >
                  Знаменатель
                </button>
              </div>
            </div>
          </div>

          {/* Кнопка "Сегодня" */}
          <div className="mb-6">
            <button 
              className="px-6 py-2 bg-card border border-gray-800 rounded-lg hover:bg-gray-900 transition-all"
              onClick={() => {
                const todayCard = document.getElementById('Понедельник') // Простой пример
                todayCard?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              📅 Сегодня
            </button>
          </div>

          {/* Карточки дней */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daysOrder.map(day => {
              const dayLessons = groupedSchedule[day] || []
              
              return (
                <div 
                  key={day} 
                  id={day}
                  className="bg-card p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <h3 className="text-xl font-semibold mb-4 text-text-primary">{day}</h3>
                  
                  {dayLessons.length > 0 ? (
                    <div className="space-y-4">
                      {dayLessons
                        .sort((a: any, b: any) => a.time.localeCompare(b.time))
                        .map((lesson: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-900/50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-text-primary">{lesson.time}</span>
                              <span className="text-xs px-2 py-1 bg-accent/20 rounded-full">
                                {lesson.type}
                              </span>
                            </div>
                            <p className="font-medium text-text-primary mb-1">{lesson.subject}</p>
                            <div className="flex justify-between text-sm text-text-secondary">
                              <span>{lesson.teacher}</span>
                              <span className="font-mono">{lesson.room}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-text-secondary">🎉 Занятий нет</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        // Экран приветствия при отсутствии выбранной группы
        <div className="bg-card rounded-xl border border-gray-800 p-8 md:p-12 text-center mt-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-text-primary">Добро пожаловать в MADI Tutor</h2>
            <p className="text-text-secondary mb-6">
              Выберите вашу учебную группу, чтобы увидеть расписание, или воспользуйтесь другими функциями сервиса.
            </p>
            <select 
              className="bg-gray-900 text-text-primary p-3 rounded-lg border border-gray-800 w-full mb-6"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">-- Выберите вашу группу --</option>
              {['ИБ-201б', 'АД-101а', 'ЭК-302в', 'ТР-204г', 'СТ-105д', 'МД-206е'].map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <p className="text-sm text-text-secondary">
              Ваш выбор сохранится автоматически
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
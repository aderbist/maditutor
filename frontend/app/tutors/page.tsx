'use client'
import { useState, useEffect } from 'react'
import { Search, Filter, Star, MessageCircle, BookOpen } from 'lucide-react'

// Типы для TypeScript
type Tutor = {
  id: number
  name: string
  subject: string
  price: string
  rating: number
  format: string[]
  about: string
  experience: string
  contacts: string
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([
    {
      id: 1,
      name: 'Иванова Мария Сергеевна',
      subject: 'Математический анализ',
      price: '800 ₽/час',
      rating: 4.8,
      format: ['Онлайн', 'Очно'],
      about: 'Студентка 4 курса МАДИ, призер олимпиад по математике',
      experience: '3 года репетиторства',
      contacts: 'Telegram: @maria_math'
    },
    {
      id: 2,
      name: 'Петров Алексей Владимирович',
      subject: 'Физика, Теоретическая механика',
      price: '1000 ₽/час',
      rating: 4.9,
      format: ['Очно'],
      about: 'Аспирант кафедры физики, автор научных статей',
      experience: '5 лет',
      contacts: 'VK: id12345, email: physics.tutor@mail.ru'
    },
    {
      id: 3,
      name: 'Сидорова Екатерина Игоревна',
      subject: 'Программирование (Python, C++)',
      price: '1200 ₽/час',
      rating: 4.7,
      format: ['Онлайн'],
      about: 'Backend-разработчик, выпускница МАДИ',
      experience: '4 года коммерческой разработки + 2 года преподавания',
      contacts: 'Telegram: @dev_mentor'
    }
  ])

  const [filters, setFilters] = useState({
    subject: '',
    format: [] as string[],
    minRating: 0
  })

  const [showForm, setShowForm] = useState(false)
  const [newTutor, setNewTutor] = useState({
    name: '',
    subject: '',
    price: '',
    format: [] as string[],
    about: '',
    contacts: ''
  })

  // Фильтрация репетиторов
  const filteredTutors = tutors.filter(tutor => {
    if (filters.subject && !tutor.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
      return false
    }
    if (filters.format.length > 0 && !filters.format.some(f => tutor.format.includes(f))) {
      return false
    }
    if (filters.minRating > 0 && tutor.rating < filters.minRating) {
      return false
    }
    return true
  })

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault()
    const newTutorWithId = {
      ...newTutor,
      id: tutors.length + 1,
      rating: 0,
      experience: 'Новый репетитор'
    }
    setTutors([...tutors, newTutorWithId])
    
    // Генерируем приватную ссылку (в реальном приложении это был бы UUID с бэкенда)
    const editToken = `edit_${Date.now()}`
    alert(`✅ Анкета создана!\n\nСохраните приватную ссылку для редактирования:\n${window.location.origin}/tutors/edit/${editToken}`)
    
    setNewTutor({ name: '', subject: '', price: '', format: [], about: '', contacts: '' })
    setShowForm(false)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Каталог репетиторов</h1>
        <p className="text-text-secondary">Найдите преподавателя среди студентов и выпускников МАДИ</p>
      </div>

      {/* Панель фильтров */}
      <div className="bg-card p-6 rounded-xl border border-gray-800 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по предмету..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className={`px-4 py-2 rounded-lg border ${filters.format.includes('Онлайн') ? 'bg-accent border-accent' : 'border-gray-800'}`}
              onClick={() => {
                const newFormats = filters.format.includes('Онлайн')
                  ? filters.format.filter(f => f !== 'Онлайн')
                  : [...filters.format, 'Онлайн']
                setFilters({...filters, format: newFormats})
              }}
            >
              💻 Онлайн
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${filters.format.includes('Очно') ? 'bg-accent border-accent' : 'border-gray-800'}`}
              onClick={() => {
                const newFormats = filters.format.includes('Очно')
                  ? filters.format.filter(f => f !== 'Очно')
                  : [...filters.format, 'Очно']
                setFilters({...filters, format: newFormats})
              }}
            >
              🏫 Очно
            </button>
            
            <select
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
            >
              <option value="0">⭐ Любой рейтинг</option>
              <option value="4">⭐ 4.0+</option>
              <option value="4.5">⭐ 4.5+</option>
              <option value="4.8">⭐ 4.8+</option>
            </select>

            <button
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all"
              onClick={() => setShowForm(true)}
            >
              + Стать репетитором
            </button>
          </div>
        </div>
      </div>

      {/* Форма создания карточки */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Создание анкеты репетитора</h2>
              <button onClick={() => setShowForm(false)} className="text-text-secondary hover:text-text-primary">✕</button>
            </div>

            <form onSubmit={handleCreateTutor} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-text-secondary">ФИО *</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                  value={newTutor.name}
                  onChange={(e) => setNewTutor({...newTutor, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-text-secondary">Предмет *</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                  value={newTutor.subject}
                  onChange={(e) => setNewTutor({...newTutor, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-text-secondary">Цена *</label>
                <input
                  type="text"
                  required
                  placeholder="800 ₽/час, 1000-1500, Договорная"
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                  value={newTutor.price}
                  onChange={(e) => setNewTutor({...newTutor, price: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-text-secondary">Формат занятий *</label>
                <div className="flex gap-3">
                  {['Онлайн', 'Очно'].map(format => (
                    <button
                      key={format}
                      type="button"
                      className={`px-4 py-2 rounded-lg border ${newTutor.format.includes(format) ? 'bg-accent border-accent' : 'border-gray-800'}`}
                      onClick={() => {
                        const newFormats = newTutor.format.includes(format)
                          ? newTutor.format.filter(f => f !== format)
                          : [...newTutor.format, format]
                        setNewTutor({...newTutor, format: newFormats})
                      }}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-text-secondary">Способы связи *</label>
                <textarea
                  required
                  placeholder="Telegram, VK, email, телефон..."
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary min-h-[100px]"
                  value={newTutor.contacts}
                  onChange={(e) => setNewTutor({...newTutor, contacts: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-text-secondary">О себе</label>
                <textarea
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary min-h-[100px]"
                  value={newTutor.about}
                  onChange={(e) => setNewTutor({...newTutor, about: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex-1">
                  Создать анкету
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список репетиторов */}
      <div className="space-y-6">
        {filteredTutors.length > 0 ? (
          filteredTutors.map(tutor => (
            <div key={tutor.id} className="bg-card p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Левая часть: фото и рейтинг */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold">{tutor.rating}</span>
                  </div>
                </div>

                {/* Центральная часть: информация */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                    <h3 className="text-xl font-bold text-text-primary">{tutor.name}</h3>
                    <span className="text-lg font-bold text-accent mt-2 md:mt-0">{tutor.price}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-sm">{tutor.subject}</span>
                    {tutor.format.map(f => (
                      <span key={f} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {f}
                      </span>
                    ))}
                  </div>

                  <p className="text-text-secondary mb-4">{tutor.about}</p>
                  <p className="text-sm text-text-secondary mb-4">📚 {tutor.experience}</p>

                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-sm text-text-secondary mb-2">📞 Контакты:</p>
                    <p className="font-mono text-sm bg-gray-900 p-3 rounded-lg">{tutor.contacts}</p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Написать
                    </button>
                    <button className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Оставить отзыв
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card p-12 rounded-xl border border-gray-800 text-center">
            <p className="text-xl text-text-secondary mb-4">😔 По вашему запросу ничего не найдено</p>
            <p className="text-text-secondary">Попробуйте расширить критерии поиска или станьте первым репетитором!</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all"
            >
              + Стать репетитором
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
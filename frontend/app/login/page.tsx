'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Book, Key } from 'lucide-react'

export default function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [groups] = useState(['ИБ-201б', 'АД-101а', 'ЭК-302в', 'ТР-204г', 'СТ-105д'])
  const router = useRouter()

  // Проверяем, есть ли сохраненная сессия
  useEffect(() => {
    const savedStudentId = localStorage.getItem('studentId')
    const savedGroup = localStorage.getItem('selectedGroup')
    
    if (savedStudentId) {
      setIsLoggedIn(true)
      setStudentId(savedStudentId)
      setSelectedGroup(savedGroup || '')
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (studentId.trim()) {
      localStorage.setItem('studentId', studentId)
      if (selectedGroup) {
        localStorage.setItem('selectedGroup', selectedGroup)
      }
      setIsLoggedIn(true)
      alert(`✅ Вход выполнен!\nНомер студенческого билета: ${studentId}`)
      router.push('/')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('studentId')
    setIsLoggedIn(false)
    setStudentId('')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-xl border border-gray-800 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Личный кабинет</h1>
          <p className="text-text-secondary">Идентификация по номеру студенческого билета</p>
        </div>

        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-text-secondary flex items-center gap-2">
                <Key className="w-4 h-4" />
                Номер студенческого билета *
              </label>
              <input
                type="text"
                required
                placeholder="Например: СТ-2023-12345"
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              <p className="text-xs text-text-secondary mt-2">Любой номер, проверка не осуществляется</p>
            </div>

            <div>
              <label className="block text-sm mb-2 text-text-secondary flex items-center gap-2">
                <Book className="w-4 h-4" />
                Ваша учебная группа
              </label>
              <select
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">-- Выберите группу (опционально) --</option>
                {groups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all font-medium"
              >
                Войти
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStudentId('СТ-2023-99999')
                    setSelectedGroup('ИБ-201б')
                  }}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Использовать тестовый аккаунт
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-text-secondary text-center">
                Это демо-версия. Пароль и email не требуются.<br />
                Для восстановления доступа используйте физический студенческий билет.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary">Статус:</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                  Активна
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-text-secondary text-sm">Студенческий билет:</span>
                  <p className="font-mono text-lg">{studentId}</p>
                </div>
                {selectedGroup && (
                  <div>
                    <span className="text-text-secondary text-sm">Учебная группа:</span>
                    <p className="text-lg">{selectedGroup}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-text-secondary">
                Сменить/выбрать группу:
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                  value={selectedGroup}
                  onChange={(e) => {
                    const newGroup = e.target.value
                    setSelectedGroup(newGroup)
                    localStorage.setItem('selectedGroup', newGroup)
                    alert('Группа сохранена!')
                  }}
                >
                  <option value="">-- Не выбрана --</option>
                  {groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    localStorage.setItem('selectedGroup', selectedGroup)
                    alert('Группа сохранена!')
                  }}
                  className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all"
                >
                  Сохранить
                </button>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-text-secondary mb-4">
                Одна учётная запись может быть активна только на одном устройстве одновременно.
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
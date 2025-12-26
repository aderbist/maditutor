'use client'
import { useState } from 'react'
import { Menu, X, Search, Calendar, Users, Info, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const menuItems = [
    { href: '/', label: 'Расписание', icon: <Calendar className="w-4 h-4" /> },
    { href: '/tutors', label: 'Каталог репетиторов', icon: <Users className="w-4 h-4" /> },
    { href: '/about', label: 'О проекте', icon: <Info className="w-4 h-4" /> },
    { href: '/login', label: 'Личный кабинет', icon: <LogIn className="w-4 h-4" /> },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Поиск: "${searchQuery}"\nВ демо-версии поиск не реализован`)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold">MADI Tutor</span>
          </Link>

          {/* Поисковая строка (десктоп) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск по дисциплинам, преподавателям..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-text-primary placeholder:text-text-secondary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Кнопка меню (мобильная) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-text-secondary hover:text-text-primary"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Навигация (десктоп) */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  pathname === item.href
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-900'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Мобильная поисковая строка */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    pathname === item.href
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
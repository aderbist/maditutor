export default function AboutPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">О проекте MADI Tutor</h1>
        <div className="h-1 w-20 bg-accent rounded-full"></div>
      </div>

      <div className="space-y-8">
        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-text-primary">🎯 Назначение сервиса</h2>
          <p className="text-text-secondary mb-4">
            MADI Tutor — единый студенческий сервис для Московского автомобильно-дорожного 
            государственного технического университета, предоставляющий актуальное университетское 
            расписание в современном формате и выполняющий функцию каталога-доски объявлений 
            для поиска репетиторов среди студентов и внешних специалистов.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-text-primary">✨ Основные принципы</h2>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Минимализм:</strong> Интерфейс очищен от любых нефункциональных элементов</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Dark Minimal:</strong> Доминирующий визуальный стиль — тёмная цветовая палитра, аскетичный дизайн</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Фокус на контенте:</strong> Максимальная ясность представления информации</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Самообслуживание:</strong> Минимальная административная нагрузка</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Демонстрационность:</strong> Проект носит учебно-демонстрационный характер</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-text-primary">📅 Модуль расписания</h3>
            <p className="text-text-secondary">
              Отображение академического расписания в формате карточек с переключением 
              между числителем и знаменателем. Интеграция с официальным сайтом МАДИ 
              (в демо-версии — мок-данные).
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-text-primary">👥 Каталог репетиторов</h3>
            <p className="text-text-secondary">
              Открытая доска объявлений для поиска репетиторов среди студентов МАДИ. 
              Самостоятельное создание карточек, система фильтров и приватные ссылки 
              для редактирования.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-text-primary">🤖 ИИ-агент</h3>
            <p className="text-text-secondary">
              Чат-помощник для учебных консультаций с возможностью загрузки файлов 
              (PDF, DOCX, изображения). Демонстрация интеллектуального анализа 
              содержимого документов.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-text-primary">🔐 Личный кабинет</h3>
            <p className="text-text-secondary">
              Упрощённая идентификация по номеру студенческого билета. Привязка учебной 
              группы для автоматического отображения расписания. Долгоживущие сессии.
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-text-primary">🛠 Технологический стек</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Next.js', desc: 'Фронтенд' },
              { name: 'TypeScript', desc: 'Типизация' },
              { name: 'Tailwind CSS', desc: 'Стилизация' },
              { name: 'FastAPI', desc: 'Бэкенд' },
              { name: 'PostgreSQL', desc: 'База данных' },
              { name: 'Docker', desc: 'Контейнеризация' },
              { name: 'Render.com', desc: 'Хостинг' },
              { name: 'Selenium', desc: 'Парсинг' },
            ].map((tech) => (
              <div key={tech.name} className="bg-gray-900 p-4 rounded-lg text-center">
                <div className="font-bold text-text-primary mb-1">{tech.name}</div>
                <div className="text-xs text-text-secondary">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-gray-800">
          <p className="text-text-secondary">
            📍 Проект разработан для демонстрации возможностей современных веб-технологий
          </p>
          <p className="text-sm text-text-secondary mt-2">
            © {new Date().getFullYear()} MADI Tutor. Все права защищены.
          </p>
        </div>
      </div>
    </div>
  )
}
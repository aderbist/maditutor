'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, X, Upload, FileText, Image, Loader, Bot, User } from 'lucide-react'

type Message = {
  id: number
  text: string
  sender: 'user' | 'ai'
  files?: Array<{ name: string; type: string; size: number }>
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Я ИИ-помощник MADI Tutor. Задайте вопрос по учёбе или загрузите файл для анализа.', sender: 'ai' }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Автопрокрутка к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Обработчик отправки сообщения
  const handleSend = async () => {
    if (!inputText.trim() && files.length === 0) return

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setFiles([])
    setIsTyping(true)

    // Имитация ответа ИИ
    setTimeout(() => {
      const responses = [
        "На основе вашего вопроса, рекомендую обратиться к учебнику 'Математический анализ' под редакцией Иванова, главы 3-5.",
        "В загруженном файле я вижу задачи по теоретической механике. Для решения подобных задач используйте принцип Даламбера.",
        "Этот материал соответствует теме 'Дифференциальные уравнения'. Обратите внимание на метод вариации постоянных.",
        "Для успешной сдачи экзамена по физике рекомендую уделить внимание разделам: термодинамика и электромагнетизм.",
        "Ваш конспект хорошо структурирован. Добавьте больше примеров применения формулы в практических задачах."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      let aiResponse = randomResponse
      if (userMessage.files && userMessage.files.length > 0) {
        aiResponse = `📁 Файл "${userMessage.files[0].name}" загружен. Анализирую содержимое...\n\n${aiResponse}`
      }
      
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        text: aiResponse,
        sender: 'ai'
      }])
      setIsTyping(false)
    }, 2000)
  }

  // Обработчик загрузки файлов
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5) // Максимум 5 файлов
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  // Drag-and-drop обработчики
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
        .filter(file => 
          file.type.startsWith('image/') || 
          file.type === 'application/pdf' ||
          file.type.includes('text') ||
          file.type.includes('document')
        )
        .slice(0, 5)
      
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  // Удаление файла
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Получение иконки для типа файла
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <>
      {/* Кнопка открытия чата */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-all z-40"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-gray-800 rounded-xl shadow-2xl flex flex-col z-50">
          {/* Шапка чата */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">ИИ-помощник MADI Tutor</h3>
                <p className="text-xs text-text-secondary">Нейтральный формальный стиль</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Область сообщений */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-gray-900 text-text-primary rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'ai' ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span className="text-xs opacity-80">
                      {message.sender === 'ai' ? 'ИИ-агент' : 'Вы'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Отображение прикрепленных файлов */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="flex flex-wrap gap-2">
                        {message.files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs bg-white/10 p-2 rounded">
                            {getFileIcon(file.type)}
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <span className="text-white/60">{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-900 text-text-primary rounded-lg rounded-bl-none p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm text-text-secondary">ИИ-агент печатает...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Область загрузки файлов */}
          {files.length > 0 && (
            <div className="px-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs bg-gray-900 text-text-primary p-2 rounded-lg"
                  >
                    {getFileIcon(file.type)}
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <span className="text-text-secondary">{formatFileSize(file.size)}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Поле ввода */}
          <div className="p-4 border-t border-gray-800">
            {/* Drag-and-drop зона */}
            <div
              className={`mb-3 p-3 border-2 border-dashed rounded-lg text-center transition-all ${
                dragOver
                  ? 'border-accent bg-accent/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5 mx-auto mb-1 text-text-secondary" />
              <p className="text-sm text-text-secondary">
                Перетащите файлы сюда или кликните для выбора
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Поддерживаются: PDF, DOCX, TXT, JPG, PNG (до 100 МБ)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Задайте вопрос по учёбе..."
                className="flex-1 p-3 bg-gray-900 border border-gray-800 rounded-lg text-text-primary"
                maxLength={5000}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() && files.length === 0}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
                  inputText.trim() || files.length > 0
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-gray-900 text-text-secondary cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between mt-3">
              <button
                onClick={() => {
                  setMessages([messages[0]])
                  setFiles([])
                  setInputText('')
                }}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                🆕 Новая тема
              </button>
              <span className="text-xs text-text-secondary">
                {inputText.length}/5000 символов
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
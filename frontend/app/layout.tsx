import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import ChatWidget from '@/components/ChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MADI Tutor',
  description: 'Сервис для студентов МАДИ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-background text-text-primary`}>
        <Header />
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
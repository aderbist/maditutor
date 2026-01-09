'use client'
import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ваш-backend-node.onrender.com';

export default function TestPage() {
  const [status, setStatus] = useState('Проверяем...');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Тест 1: Проверка основного эндпоинта
    fetch(`${API_URL}/`)
      .then(res => res.json())
      .then(data => {
        setStatus('✅ Бэкенд работает');
        setData(data);
      })
      .catch(err => {
        setStatus(`❌ Ошибка: ${err.message}`);
      });

    // Тест 2: Проверка списка групп
    fetch(`${API_URL}/api/groups`)
      .then(res => res.json())
      .then(groupsData => {
        console.log('Группы:', groupsData);
      })
      .catch(err => {
        console.error('Ошибка групп:', err);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест подключения к API</h1>
      <p>URL API: {API_URL}</p>
      <p>Статус: {status}</p>
      {data && (
        <pre className="mt-4 p-4 bg-gray-900 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
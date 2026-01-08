const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Tutor {
  id: string;
  full_name: string;
  subject: string;
  price: string;
  rating: number;
  review_count: number;
  format_online: boolean;
  format_offline: boolean;
  about: string;
  experience: string;
  contacts: string;
  topics?: string;
  convenient_time?: string;
  created_at: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  student_ticket: string;
  student_name?: string;
  created_at: string;
}

export interface CreateTutorData {
  full_name: string;
  subject: string;
  price: string;
  contacts: string;
  format_online?: boolean;
  format_offline?: boolean;
  about?: string;
  experience?: string;
  convenient_time?: string;
  topics?: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
  student_ticket: string;
  student_name?: string;
}

// API функции
export const api = {
  // Расписание
  async getSchedule(weekType: 'numerator' | 'denominator') {
    const res = await fetch(`${API_BASE}/api/schedule/${weekType}`);
    if (!res.ok) throw new Error('Ошибка загрузки расписания');
    return res.json();
  },

  // Репетиторы
  async getTutors(filters?: {
    subject?: string;
    format_online?: boolean;
    format_offline?: boolean;
    min_rating?: number;
    limit?: number;
    offset?: number;
    sort_by?: string;
    order?: string;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const url = `${API_BASE}/api/tutors${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка загрузки репетиторов');
    return res.json() as Promise<Tutor[]>;
  },

  async getTutor(id: string) {
    const res = await fetch(`${API_BASE}/api/tutors/${id}`);
    if (!res.ok) throw new Error('Репетитор не найден');
    return res.json() as Promise<Tutor & { reviews: Review[] }>;
  },

  async createTutor(data: CreateTutorData) {
    const res = await fetch(`${API_BASE}/api/tutors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data as any).toString()
    });
    if (!res.ok) throw new Error('Ошибка создания анкеты');
    return res.json();
  },

  async updateTutor(editToken: string, data: Partial<CreateTutorData>) {
    const res = await fetch(`${API_BASE}/api/tutors/${editToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data as any).toString()
    });
    if (!res.ok) throw new Error('Ошибка обновления анкеты');
    return res.json();
  },

  async createReview(tutorId: string, data: CreateReviewData) {
    const res = await fetch(`${API_BASE}/api/tutors/${tutorId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Ошибка создания отзыва');
    return res.json();
  },

  async getReviews(tutorId: string) {
    const res = await fetch(`${API_BASE}/api/tutors/${tutorId}/reviews`);
    if (!res.ok) throw new Error('Ошибка загрузки отзывов');
    return res.json() as Promise<Review[]>;
  },

  // ИИ-чат
  async chatWithAI(message: string, files?: File[]) {
    const formData = new FormData();
    formData.append('message', message);
    
    if (files) {
      files.forEach(file => formData.append('files', file));
    }
    
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Ошибка ИИ-агента');
    return res.json();
  }
};
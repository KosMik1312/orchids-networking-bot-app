// API functions for communicating with the Python backend

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.leracinema.ru'; // Из переменной окружения или значение по умолчанию
console.log('🔧 API_BASE:', API_BASE);

// --- Custom Error Class ---
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Helper function to handle fetch responses ---
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // For 204 No Content, we might not have a body
    if (response.status === 204) {
      return {} as T;
    }
    return response.json();
  }

  // Try to read body as text first, because backend might return non-JSON error
  const text = await response.text().catch(() => '');
  let errorData: any = undefined;
  try {
    errorData = text ? JSON.parse(text) : undefined;
  } catch {
    // ignore
  }

  const message = errorData?.error || errorData?.detail || text || 'An unknown error occurred';
  throw new ApiError(message, response.status);
}


export interface UserProfile {
  name: string;
  age: number;
  gender?: string;
  relationship_status?: string;
  children?: string;
  occupation?: string;
  goal?: string;
  interests?: string;
  comfort_level?: number;
  social_frequency?: number;
  communication_format?: string;
  evening_scenario?: string;
  telegram?: string;
  instagram?: string;
  photo?: string;
  about_me?: string;
  city?: string;
  // Meeting-related
  meeting_metro?: string[];
  meeting_days?: string[];
  meeting_time_from?: string;
  meeting_time_to?: string;
  // Frontend uses `format` key for meeting format; backend maps it to communication_format
  format?: string;
  is_profile_completed?: boolean;
}

export interface Slot {
  id: number;
  date: string;
  time: string;
  city: string;
  restaurant: string;
  max_people: number;
  current_bookings: number;
  created_at: string;
  is_active: number;
}

export interface Booking {
  id: number;
  user_id: number;
  slot_id: number;
  booking_date: string;
  status: string;
  date: string;
  time: string;
  city: string;
  restaurant: string;
  max_people: number;
  current_bookings?: number;
}

export interface Contact {
  name: string;
  age?: number;
  city?: string;
  interests?: string;
  photo?: string;
  telegram?: string;
  instagram?: string;
  about_me?: string;
  id?: string; // For support contact
  isSupport?: boolean; // For support contact
}

// Profile API
export async function saveProfile(userId: number, profile: Partial<UserProfile>, token?: string): Promise<{ success: boolean }> {
  const url = `${API_BASE}/api/profile`;
  console.log('🔗 Запрос к:', url);
  console.log('📤 Payload:', { userId, profile });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    cache: 'no-store',
    body: JSON.stringify({ userId, profile }),
  });

  console.log('📡 Ответ:', response.status, response.statusText);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.log('❌ Текст ошибки:', text);
  }

  return handleResponse(response);
}

export async function getProfile(userId?: number, token?: string): Promise<{ profile: UserProfile }> {
  // Если передан только токен, используем его
  // Если передан userId, используем его
  // Иначе выбрасываем ошибку
  if (!userId && !token) {
    throw new ApiError('Either userId or token must be provided', 400);
  }

  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());

  const url = `${API_BASE}/api/profile${params.toString() ? '?' + params.toString() : ''}`;
  console.log('🔗 Запрос к:', url);

  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  console.log('📡 Ответ:', response.status, response.statusText);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.log('❌ Текст ошибки:', text);
  }

  return handleResponse(response);
}

// Slots API
export async function getSlots(city?: string): Promise<{ slots: Slot[] }> {
  const url = city ? `${API_BASE}/api/slots?city=${encodeURIComponent(city)}` : `${API_BASE}/api/slots`;
  console.log('🔗 Запрос к:', url);

  try {
    const response = await fetch(url);
    console.log('📡 Ответ:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.log('❌ Текст ошибки:', text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    console.log('✅ Данные:', data);
    return data;
  } catch (error) {
    console.error('💥 Ошибка fetch:', error);
    throw error;
  }
}

// Bookings API
export async function getUserBookings(userId: number): Promise<{ bookings: Booking[] }> {
  console.log(`[API] Requesting bookings for userId=${userId} from ${API_BASE}/api/bookings`);
  const response = await fetch(`${API_BASE}/api/bookings?userId=${userId}`);
  const result = await handleResponse<{ bookings: Booking[] }>(response);
  console.log(`[API] Got bookings response:`, result);
  return result;
}

export async function createBooking(userId: number, slotId: number): Promise<{ success: boolean }> {
  console.log(`[API] Creating booking: userId=${userId}, slotId=${slotId}`);
  console.log(`[API] Request body:`, JSON.stringify({ userId, slotId }));

  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, slotId }),
  });

  console.log(`[API] Booking response status: ${response.status}`);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.log(`[API] Booking error response:`, text);
  }

  return handleResponse(response);
}

// Contacts API
export async function getContacts(slotId: number, userId: number): Promise<{ contacts: Contact[] }> {
  const response = await fetch(`${API_BASE}/api/contacts?slotId=${slotId}&userId=${userId}`);
  return handleResponse(response);
}
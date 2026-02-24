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
  zodiac?: string;
  relationship_status?: string;
  children?: string;
  occupation?: string;
  goal?: string[];
  interests?: string;
  comfort_level?: number;
  social_frequency?: number;
  communication_format?: string[] | string;
  evening_scenario?: string;
  telegram?: string;
  instagram?: string;
  photo?: string;
  about_me?: string;
  city?: string;
  // BestInMeScreen fields
  strengths?: string[];
  weaknesses?: string;
  values?: string[];
  love_language?: string[];
  goals?: string;
  dreams?: string;
  // Meeting-related
  meeting_metro?: string[];
  meeting_days?: string[];
  meeting_time_from?: string;
  meeting_time_to?: string;
  // Frontend uses `format` key for meeting format; backend maps it to communication_format
  format?: string[];
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
  created_at: string | null;
  is_active: boolean;
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
  id?: string | number;
  isSupport?: boolean;
  is_teammate?: boolean;
}

// Profile API - uses hybrid authentication (Telegram initData or JWT)
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export async function saveProfile(userId: number, profile: Partial<UserProfile>, authToken?: string): Promise<{ success: boolean }> {
  const url = `${API_BASE}/api/profile`;
  console.log('🔗 Запрос к:', url);
  console.log('📤 userId:', userId);
  console.log('📤 authToken present:', !!authToken);
  if (authToken) {
    console.log('📤 authToken (first 100 chars):', authToken.substring(0, 100));
  }
  console.log('📤 profile keys:', Object.keys(profile));

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 🎯 Передаём initData/JWT в Authorization заголовке
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📤 Auth header set');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    cache: 'no-store',
    body: JSON.stringify({ userId, profile }),
  });

  console.log('📡 Ответ:', response.status, response.statusText);

  return handleResponse(response);
}

export async function getProfile(userId?: number, authToken?: string): Promise<{ profile: UserProfile }> {
  const url = `${API_BASE}/api/profile`;
  console.log('🔗 Запрос к:', url);
  console.log('📤 userId:', userId);
  console.log('📤 authToken present:', !!authToken);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 🎯 Передаём initData/JWT в Authorization заголовке
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📤 Auth header set');
  }

  // Добавляем userId в query параметры если он есть
  const queryParams = userId ? `?userId=${userId}` : '';
  const fullUrl = url + queryParams;

  const response = await fetch(fullUrl, {
    method: 'GET',
    cache: 'no-store',
    headers,
  });

  console.log('📡 Ответ:', response.status, response.statusText);

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

// Bookings API - uses hybrid authentication (Telegram initData or JWT)
export async function getUserBookings(userId: number, authToken?: string): Promise<{ bookings: Booking[] }> {
  console.log(`[API] Requesting bookings for userId=${userId}`);

  const headers: HeadersInit = {};

  // 🎯 Передаём initData/JWT в Authorization заголовке
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📤 Auth header set');
  }

  const response = await fetch(`${API_BASE}/api/bookings/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'no-store',
  });

  console.log(`[API] Bookings response status: ${response.status}`);
  const result = await handleResponse<{ bookings: Booking[] }>(response);
  console.log(`[API] Got bookings response:`, result);
  return result;
}

export async function createBooking(slotId: number, authToken?: string): Promise<{ success: boolean }> {
  console.log(`[API] Creating booking: slotId=${slotId}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 🎯 Передаём initData/JWT в Authorization заголовке
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📤 Auth header set');
  }

  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers,
    cache: 'no-store',
    body: JSON.stringify({ slotId }),
  });

  console.log(`[API] Booking response status: ${response.status}`);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.log(`[API] Booking error response:`, text);
  }

  return handleResponse(response);
}

// Contacts API - uses hybrid authentication (Telegram initData or JWT)
export async function getContacts(slotId: number, authToken?: string): Promise<{ contacts: Contact[] }> {
  console.log(`[API] Getting contacts for slotId=${slotId}`);

  const headers: HeadersInit = {};

  // 🎯 Передаём initData/JWT в Authorization заголовке
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('📤 Auth header set');
  }

  const response = await fetch(`${API_BASE}/api/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'no-store',
    body: JSON.stringify({ slotId }),
  });

  console.log(`[API] Contacts response status: ${response.status}`);
  return handleResponse(response);
}

// Favorites API
export async function toggleFavorite(slotId: number, authToken?: string): Promise<{ success: boolean; favorites: number[] }> {
  console.log(`[API] Toggling favorite: slotId=${slotId}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}/api/favorites/toggle?slot_id=${slotId}`, {
    method: 'POST',
    headers,
    cache: 'no-store',
  });

  console.log(`[API] Toggle favorite response status: ${response.status}`);
  return handleResponse(response);
}

export async function getFavorites(authToken?: string): Promise<{ favorites: Slot[] }> {
  console.log(`[API] Getting favorites`);

  const headers: HeadersInit = {};

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}/api/favorites`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  console.log(`[API] Get favorites response status: ${response.status}`);
  return handleResponse(response);
}
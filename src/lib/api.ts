// API functions for communicating with the Python backend

const API_BASE = 'https://hungry-geckos-warn.loca.lt'; // Жестко задано для отладки
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
  } else {
    const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    throw new ApiError(errorData.error || 'An unknown error occurred', response.status);
  }
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
export async function saveProfile(userId: number, profile: Partial<UserProfile>): Promise<{success: boolean}> {
  const response = await fetch(`${API_BASE}/api/profile`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'bypass-tunnel-reminder': 'true'
    },
    body: JSON.stringify({ userId, profile }),
  });
  return handleResponse(response);
}

export async function getProfile(userId: number): Promise<{ profile: UserProfile }> {
  const response = await fetch(`${API_BASE}/api/profile?userId=${userId}`, {
    headers: {
      'bypass-tunnel-reminder': 'true'
    }
  });
  return handleResponse(response);
}

// Slots API
export async function getSlots(city?: string): Promise<{ slots: Slot[] }> {
  const url = city ? `${API_BASE}/api/slots?city=${encodeURIComponent(city)}` : `${API_BASE}/api/slots`;
  console.log('🔗 Запрос к:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'bypass-tunnel-reminder': 'true'
      }
    });
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
  const response = await fetch(`${API_BASE}/api/bookings?userId=${userId}`, {
    headers: {
      'bypass-tunnel-reminder': 'true'
    }
  });
  return handleResponse(response);
}

export async function createBooking(userId: number, slotId: number): Promise<{success: boolean}> {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'bypass-tunnel-reminder': 'true'
    },
    body: JSON.stringify({ userId, slotId }),
  });
  return handleResponse(response);
}

// Contacts API
export async function getContacts(slotId: number, userId: number): Promise<{ contacts: Contact[] }> {
  const response = await fetch(`${API_BASE}/api/contacts?slotId=${slotId}&userId=${userId}`, {
    headers: {
      'bypass-tunnel-reminder': 'true'
    }
  });
  return handleResponse(response);
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://81.177.6.20:8000';

async function adminFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export interface AdminUser {
  user_id: number;
  name: string | null;
  age: number | null;
  gender: string | null;
  city: string | null;
  telegram: string | null;
  instagram: string | null;
  is_profile_completed: boolean;
  created_at: string | null;
}

export interface AdminSlot {
  id: number;
  date: string;
  time: string;
  city: string;
  restaurant: string;
  max_people: number;
  current_bookings: number;
  is_active: boolean;
  created_at: string | null;
}

export interface SlotParticipant {
  user_id: number;
  name: string | null;
  telegram: string | null;
  instagram: string | null;
  city: string | null;
  booking_id: number;
  booking_status: string;
  booking_date: string | null;
  paid: boolean;
  payment_amount: string | null;
}

export interface AdminGroup {
  id: number;
  name: string;
  created_at: string | null;
  member_count: number;
}

export interface GroupMember {
  user_id: number;
  name: string | null;
  telegram: string | null;
  city: string | null;
}

export interface AdminStats {
  total_users: number;
  total_slots: number;
  active_slots: number;
  total_bookings: number;
  total_paid: number;
}

export interface BroadcastResult {
  sent: number;
  failed: number;
  errors: string[];
}

// Проверка авторизации
export async function checkAdmin(token: string): Promise<{ user_id: number; is_admin: boolean }> {
  return adminFetch('/api/admin/me', token);
}

// Статистика
export async function getAdminStats(token: string): Promise<AdminStats> {
  return adminFetch('/api/admin/stats', token);
}

// Пользователи
export async function getAdminUsers(token: string, limit = 50, offset = 0): Promise<{ total: number; users: AdminUser[] }> {
  return adminFetch(`/api/admin/users?limit=${limit}&offset=${offset}`, token);
}

// Мероприятия (слоты)
export async function getAdminSlots(token: string): Promise<{ slots: AdminSlot[] }> {
  return adminFetch('/api/admin/slots', token);
}

export async function createAdminSlot(token: string, data: { date: string; time: string; city: string; restaurant: string; max_people: number }) {
  return adminFetch('/api/admin/slots', token, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAdminSlot(token: string, slotId: number, data: Partial<AdminSlot>) {
  return adminFetch(`/api/admin/slots/${slotId}`, token, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function getSlotDetail(token: string, slotId: number): Promise<AdminSlot> {
  return adminFetch(`/api/admin/slots/${slotId}`, token);
}

export async function getSlotParticipants(token: string, slotId: number): Promise<{ slot_id: number; participants: SlotParticipant[] }> {
  return adminFetch(`/api/admin/slots/${slotId}/participants`, token);
}

// Группы
export async function getAdminGroups(token: string): Promise<{ groups: AdminGroup[] }> {
  return adminFetch('/api/admin/groups', token);
}

export async function createAdminGroup(token: string, name: string) {
  return adminFetch('/api/admin/groups', token, { method: 'POST', body: JSON.stringify({ name }) });
}

export async function deleteAdminGroup(token: string, groupId: number) {
  return adminFetch(`/api/admin/groups/${groupId}`, token, { method: 'DELETE' });
}

export async function getGroupMembers(token: string, groupId: number): Promise<{ group_id: number; members: GroupMember[] }> {
  return adminFetch(`/api/admin/groups/${groupId}/members`, token);
}

export async function addGroupMembers(token: string, groupId: number, userIds: number[]) {
  return adminFetch(`/api/admin/groups/${groupId}/members`, token, { method: 'POST', body: JSON.stringify({ user_ids: userIds }) });
}

export async function removeGroupMember(token: string, groupId: number, userId: number) {
  return adminFetch(`/api/admin/groups/${groupId}/members/${userId}`, token, { method: 'DELETE' });
}

// Рассылка
export async function sendBroadcast(token: string, data: { text: string; group_ids?: number[]; slot_id?: number }): Promise<BroadcastResult> {
  return adminFetch('/api/admin/broadcast', token, { method: 'POST', body: JSON.stringify(data) });
}

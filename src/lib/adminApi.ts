const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://antreclub-app.ru';

async function adminFetch<T>(path: string, initData: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: options?.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    body: JSON.stringify({
      ...(options?.body ? JSON.parse(options.body as string) : {}),
      initData,
    }),
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
export async function checkAdmin(initData: string): Promise<{ user_id: number; is_admin: boolean }> {
  return adminFetch('/api/admin/me', initData);
}

// Статистика
export async function getAdminStats(initData: string): Promise<AdminStats> {
  return adminFetch('/api/admin/stats', initData);
}

// Пользователи
export async function getAdminUsers(initData: string, limit = 50, offset = 0): Promise<{ total: number; users: AdminUser[] }> {
  return adminFetch(`/api/admin/users?limit=${limit}&offset=${offset}`, initData);
}

// Мероприятия (слоты)
export async function getAdminSlots(initData: string): Promise<{ slots: AdminSlot[] }> {
  return adminFetch('/api/admin/slots', initData);
}

export async function createAdminSlot(initData: string, data: { date: string; time: string; city: string; restaurant: string; max_people: number }) {
  return adminFetch('/api/admin/slots/create', initData, { body: JSON.stringify(data) });
}

export async function updateAdminSlot(initData: string, slotId: number, data: Partial<AdminSlot>) {
  return adminFetch(`/api/admin/slots/${slotId}`, initData, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function getSlotDetail(initData: string, slotId: number): Promise<AdminSlot> {
  return adminFetch(`/api/admin/slots/${slotId}`, initData);
}

export async function getSlotParticipants(initData: string, slotId: number): Promise<{ slot_id: number; participants: SlotParticipant[] }> {
  return adminFetch(`/api/admin/slots/${slotId}/participants`, initData);
}

// Группы
export async function getAdminGroups(initData: string): Promise<{ groups: AdminGroup[] }> {
  return adminFetch('/api/admin/groups', initData);
}

export async function createAdminGroup(initData: string, name: string): Promise<AdminGroup> {
  return adminFetch<AdminGroup>('/api/admin/groups/create', initData, { body: JSON.stringify({ name }) });
}

export async function deleteAdminGroup(initData: string, groupId: number) {
  return adminFetch(`/api/admin/groups/${groupId}/delete`, initData);
}

export async function getGroupMembers(initData: string, groupId: number): Promise<{ group_id: number; members: GroupMember[] }> {
  return adminFetch(`/api/admin/groups/${groupId}/members`, initData);
}

export async function addGroupMembers(initData: string, groupId: number, userIds: number[]) {
  return adminFetch(`/api/admin/groups/${groupId}/members/add`, initData, { body: JSON.stringify({ user_ids: userIds }) });
}

export async function removeGroupMember(initData: string, groupId: number, userId: number) {
  return adminFetch(`/api/admin/groups/${groupId}/members/${userId}/remove`, initData);
}

// Рассылка
export async function sendBroadcast(initData: string, data: { text: string; group_ids?: number[]; slot_id?: number }): Promise<BroadcastResult> {
  return adminFetch('/api/admin/broadcast', initData, { method: 'POST', body: JSON.stringify(data) });
}

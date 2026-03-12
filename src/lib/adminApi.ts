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

export interface AdminUserProfile extends AdminUser {
  photo?: string;
  about_me?: string;
  occupation?: string;
  interests?: string | string[];
  goal?: string | string[];
  comfort_level?: number;
  social_frequency?: number;
  communication_format?: string | string[];
  evening_scenario?: string;
  relationship_status?: string;
  children?: string;
  zodiac?: string;
  strengths?: string | string[];
  weaknesses?: string;
  values?: string | string[];
  love_language?: string | string[];
  goals?: string;
  dreams?: string;
  meeting_metro?: string | string[];
  meeting_days?: string | string[];
  meeting_time_from?: string;
  meeting_time_to?: string;
}

export interface AdminSlot {
  id: number;
  date: string;
  time: string;
  city: string;
  restaurant: string;
  max_people: number;
  price: number;
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
  status: string;
  target_count: number;
  message?: string;
  sent?: number;
  failed?: number;
  errors?: string[];
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

export async function getAdminUserProfile(initData: string, userId: number): Promise<AdminUserProfile> {
  return adminFetch(`/api/admin/users/${userId}/profile`, initData);
}

// Мероприятия (слоты)
export async function getAdminSlots(initData: string): Promise<{ slots: AdminSlot[] }> {
  return adminFetch('/api/admin/slots', initData);
}

export async function createAdminSlot(initData: string, data: { date: string; time: string; city: string; restaurant: string; max_people: number; price: number }) {
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
export async function getAdminGroups(initData: string, slotId?: number): Promise<{ groups: AdminGroup[] }> {
  return adminFetch('/api/admin/groups', initData, { body: JSON.stringify({ slot_id: slotId }) });
}

export async function createAdminGroup(initData: string, name: string, slotId?: number): Promise<AdminGroup> {
  return adminFetch<AdminGroup>('/api/admin/groups/create', initData, { body: JSON.stringify({ name, slot_id: slotId }) });
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
export async function sendBroadcast(initData: string, data: { text: string; group_ids?: number[]; slot_id?: number; all_users?: boolean }): Promise<BroadcastResult> {
  return adminFetch('/api/admin/broadcast', initData, { method: 'POST', body: JSON.stringify(data) });
}

// Акции и предложения
export interface AdminPromotion {
  id: number;
  title: string;
  description: string;
  target_audience: string | null;
  price: number;
  quantity: number;
  validity_days: number;
  is_active: boolean;
  created_at: string | null;
}

export async function getAdminPromotions(initData: string): Promise<{ promotions: AdminPromotion[] }> {
  return adminFetch('/api/admin/promotions', initData);
}

export async function createAdminPromotion(initData: string, data: { title: string; description: string; target_audience?: string; price: number; quantity?: number; validity_days?: number }) {
  return adminFetch('/api/admin/promotions/create', initData, { body: JSON.stringify(data) });
}

export async function updateAdminPromotion(initData: string, promotionId: number, data: Partial<AdminPromotion>) {
  return adminFetch(`/api/admin/promotions/${promotionId}`, initData, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteAdminPromotion(initData: string, promotionId: number) {
  return adminFetch(`/api/admin/promotions/${promotionId}/delete`, initData);
}

// Платежи
export interface AdminPayment {
  id: number;
  user_id: number;
  user_name: string;
  amount: string;
  status: 'created' | 'pending' | 'succeeded' | 'failed' | 'canceled' | 'expired' | 'refunded';
  slot_id: number | null;
  booking_id: number | null;
  yookassa_payment_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminPaymentDetail extends AdminPayment {
  user_telegram: string | null;
  slot_info: {
    date: string | null;
    time: string | null;
    restaurant: string | null;
    city: string | null;
  } | null;
  booking_status: string | null;
}

export interface AdminPaymentStats {
  total_revenue: number;
  total_payments: number;
  conversion_rate: number;
  average_payment: number;
  status_breakdown: {
    created: number;
    pending: number;
    succeeded: number;
    failed: number;
    canceled: number;
    expired: number;
    refunded: number;
  };
}

export async function getAdminPayments(
  initData: string,
  status?: string,
  limit = 50,
  offset = 0
): Promise<{ total: number; payments: AdminPayment[] }> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  return adminFetch(`/api/admin/payments?${params.toString()}`, initData);
}

export async function getAdminPaymentDetail(
  initData: string,
  paymentId: number
): Promise<AdminPaymentDetail> {
  return adminFetch(`/api/admin/payments/${paymentId}`, initData);
}

export async function getAdminPaymentStats(initData: string): Promise<AdminPaymentStats> {
  return adminFetch('/api/admin/payments/stats', initData);
}

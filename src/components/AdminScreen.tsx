"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Users, Calendar, UsersRound, Send, BarChart3, Plus, Trash2, ChevronRight, Check, X, RefreshCw } from "lucide-react";
import {
  checkAdmin, getAdminStats, getAdminUsers, getAdminSlots, createAdminSlot,
  updateAdminSlot, getSlotParticipants, getAdminGroups, createAdminGroup,
  deleteAdminGroup, getGroupMembers, addGroupMembers, removeGroupMember,
  sendBroadcast,
  type AdminStats, type AdminUser, type AdminSlot, type SlotParticipant,
  type AdminGroup, type GroupMember, type BroadcastResult,
} from "@/lib/adminApi";

type AdminTab = "dashboard" | "users" | "slots" | "slot_detail" | "groups" | "group_detail" | "broadcast";

interface AdminScreenProps {
  token: string;
  onBack?: () => void;
}

export function AdminScreen({ token, onBack }: AdminScreenProps) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<SlotParticipant[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форма создания мероприятия
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: "", time: "", city: "", restaurant: "", max_people: "" });

  // Создание группы
  const [newGroupName, setNewGroupName] = useState("");

  // Добавление участников
  const [addMemberIds, setAddMemberIds] = useState("");

  // Рассылка
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"groups" | "slot">("groups");
  const [broadcastGroupIds, setBroadcastGroupIds] = useState<number[]>([]);
  const [broadcastSlotId, setBroadcastSlotId] = useState<number | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);

  useEffect(() => {
    checkAdmin(token)
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false));
  }, [token]);

  const loadStats = useCallback(async () => {
    try {
      const s = await getAdminStats(token);
      setStats(s);
    } catch (e: any) { setError(e.message); }
  }, [token]);

  const loadUsers = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await getAdminUsers(token, 50, page * 50);
      setUsers(res.users);
      setUsersTotal(res.total);
      setUsersPage(page);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [token]);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSlots(token);
      setSlots(res.slots);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [token]);

  const loadParticipants = useCallback(async (slotId: number) => {
    setLoading(true);
    try {
      const res = await getSlotParticipants(token, slotId);
      setParticipants(res.participants);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [token]);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminGroups(token);
      setGroups(res.groups);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [token]);

  const loadGroupMembers = useCallback(async (groupId: number) => {
    setLoading(true);
    try {
      const res = await getGroupMembers(token, groupId);
      setGroupMembers(res.members);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (authorized) loadStats();
  }, [authorized, loadStats]);

  useEffect(() => {
    if (tab === "users") loadUsers(0);
    if (tab === "slots") loadSlots();
    if (tab === "groups") loadGroups();
    if (tab === "broadcast") { loadGroups(); loadSlots(); }
  }, [tab, loadUsers, loadSlots, loadGroups]);

  useEffect(() => {
    if (selectedSlotId && tab === "slot_detail") loadParticipants(selectedSlotId);
  }, [selectedSlotId, tab, loadParticipants]);

  useEffect(() => {
    if (selectedGroupId && tab === "group_detail") loadGroupMembers(selectedGroupId);
  }, [selectedGroupId, tab, loadGroupMembers]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E9E9E9" }}>
        <div className="text-[#404243] text-lg">Проверка доступа...</div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: "#E9E9E9" }}>
        <div className="text-[#E15859] text-xl font-bold">Нет доступа</div>
        <div className="text-[#404243] text-center">Откройте админ-панель через команду /admin в боте.</div>
        {onBack && (
          <button onClick={onBack} className="mt-4 px-6 py-3 bg-[#E15859] text-white rounded-2xl font-medium">Назад</button>
        )}
      </div>
    );
  }

  const handleCreateSlot = async () => {
    if (!slotForm.date || !slotForm.time || !slotForm.city || !slotForm.restaurant || !slotForm.max_people) return;
    setLoading(true);
    try {
      await createAdminSlot(token, { ...slotForm, max_people: parseInt(slotForm.max_people) });
      setShowSlotForm(false);
      setSlotForm({ date: "", time: "", city: "", restaurant: "", max_people: "" });
      await loadSlots();
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const handleToggleSlotActive = async (slot: AdminSlot) => {
    try {
      await updateAdminSlot(token, slot.id, { is_active: !slot.is_active });
      await loadSlots();
    } catch (e: any) { setError(e.message); }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createAdminGroup(token, newGroupName.trim());
      setNewGroupName("");
      await loadGroups();
    } catch (e: any) { setError(e.message); }
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      await deleteAdminGroup(token, groupId);
      await loadGroups();
    } catch (e: any) { setError(e.message); }
  };

  const handleAddMembers = async () => {
    if (!selectedGroupId || !addMemberIds.trim()) return;
    const ids = addMemberIds.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (ids.length === 0) return;
    try {
      await addGroupMembers(token, selectedGroupId, ids);
      setAddMemberIds("");
      await loadGroupMembers(selectedGroupId);
    } catch (e: any) { setError(e.message); }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroupId) return;
    try {
      await removeGroupMember(token, selectedGroupId, userId);
      await loadGroupMembers(selectedGroupId);
    } catch (e: any) { setError(e.message); }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setLoading(true);
    setBroadcastResult(null);
    try {
      const data: any = { text: broadcastText };
      if (broadcastTarget === "groups" && broadcastGroupIds.length > 0) data.group_ids = broadcastGroupIds;
      if (broadcastTarget === "slot" && broadcastSlotId) data.slot_id = broadcastSlotId;
      if (!data.group_ids && !data.slot_id) { setError("Выберите получателей"); setLoading(false); return; }
      const result = await sendBroadcast(token, data);
      setBroadcastResult(result);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const cardClass = "bg-white rounded-2xl p-4 shadow-sm mb-3";
  const btnPrimary = "bg-[#E15859] text-white rounded-2xl px-4 py-3 font-medium text-sm w-full";
  const btnSecondary = "bg-white border border-[#E15859] text-[#E15859] rounded-2xl px-4 py-2 font-medium text-sm";
  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E15859]";

  const renderHeader = (title: string, backTo?: AdminTab) => (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={() => backTo ? setTab(backTo) : undefined} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <ArrowLeft size={20} className="text-[#404243]" />
      </button>
      <h1 className="text-[#E15859] text-xl font-bold uppercase tracking-tight">{title}</h1>
    </div>
  );

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      <div className="flex-1 flex flex-col px-5 pt-10 pb-8">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex justify-between items-center">
            <span className="text-red-600 text-sm">{error}</span>
            <button onClick={() => setError(null)}><X size={16} className="text-red-400" /></button>
          </div>
        )}

        {/* ===== ДАШБОРД ===== */}
        {tab === "dashboard" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[#E15859] text-2xl font-black uppercase tracking-tight">Админ-панель</h1>
              {onBack && (
                <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <X size={20} className="text-[#404243]" />
                </button>
              )}
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={cardClass}>
                  <div className="text-2xl font-bold text-[#404243]">{stats.total_users}</div>
                  <div className="text-xs text-gray-400 mt-1">Пользователей</div>
                </div>
                <div className={cardClass}>
                  <div className="text-2xl font-bold text-[#404243]">{stats.active_slots}</div>
                  <div className="text-xs text-gray-400 mt-1">Активных слотов</div>
                </div>
                <div className={cardClass}>
                  <div className="text-2xl font-bold text-[#404243]">{stats.total_bookings}</div>
                  <div className="text-xs text-gray-400 mt-1">Бронирований</div>
                </div>
                <div className={cardClass}>
                  <div className="text-2xl font-bold text-[#404243]">{stats.total_paid}</div>
                  <div className="text-xs text-gray-400 mt-1">Оплачено</div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {[
                { icon: Users, label: "Пользователи", t: "users" as AdminTab },
                { icon: Calendar, label: "Мероприятия", t: "slots" as AdminTab },
                { icon: UsersRound, label: "Группы", t: "groups" as AdminTab },
                { icon: Send, label: "Рассылка", t: "broadcast" as AdminTab },
              ].map(({ icon: Icon, label, t }) => (
                <button key={t} onClick={() => setTab(t)} className={`${cardClass} flex items-center gap-4 text-left`}>
                  <div className="w-11 h-11 bg-[#E15859] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="font-medium text-[#404243] flex-1">{label}</span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* ===== ПОЛЬЗОВАТЕЛИ ===== */}
        {tab === "users" && (
          <>
            {renderHeader("Пользователи", "dashboard")}
            <div className="text-xs text-gray-400 mb-3">Всего: {usersTotal}</div>
            {users.map(u => (
              <div key={u.user_id} className={cardClass}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[#404243]">{u.name || "Без имени"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">ID: {u.user_id}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${u.is_profile_completed ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {u.is_profile_completed ? "Заполнен" : "Не заполнен"}
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  {u.city && <span>{u.city}</span>}
                  {u.telegram && <span>TG: {u.telegram}</span>}
                  {u.gender && <span>{u.gender === "male" ? "М" : "Ж"}</span>}
                  {u.age && <span>{u.age} лет</span>}
                </div>
              </div>
            ))}
            {usersTotal > 50 && (
              <div className="flex gap-2 justify-center mt-2">
                {usersPage > 0 && <button onClick={() => loadUsers(usersPage - 1)} className={btnSecondary}>Назад</button>}
                {(usersPage + 1) * 50 < usersTotal && <button onClick={() => loadUsers(usersPage + 1)} className={btnSecondary}>Далее</button>}
              </div>
            )}
          </>
        )}

        {/* ===== МЕРОПРИЯТИЯ ===== */}
        {tab === "slots" && (
          <>
            {renderHeader("Мероприятия", "dashboard")}
            <button onClick={() => setShowSlotForm(!showSlotForm)} className={`${btnPrimary} mb-4 flex items-center justify-center gap-2`}>
              <Plus size={18} /> Создать мероприятие
            </button>

            {showSlotForm && (
              <div className={`${cardClass} flex flex-col gap-2`}>
                <input placeholder="Дата (ДД.ММ.ГГГГ)" value={slotForm.date} onChange={e => setSlotForm(p => ({ ...p, date: e.target.value }))} className={inputClass} />
                <input placeholder="Время (ЧЧ:ММ)" value={slotForm.time} onChange={e => setSlotForm(p => ({ ...p, time: e.target.value }))} className={inputClass} />
                <input placeholder="Город" value={slotForm.city} onChange={e => setSlotForm(p => ({ ...p, city: e.target.value }))} className={inputClass} />
                <input placeholder="Ресторан" value={slotForm.restaurant} onChange={e => setSlotForm(p => ({ ...p, restaurant: e.target.value }))} className={inputClass} />
                <input placeholder="Макс. участников" type="number" value={slotForm.max_people} onChange={e => setSlotForm(p => ({ ...p, max_people: e.target.value }))} className={inputClass} />
                <button onClick={handleCreateSlot} disabled={loading} className={btnPrimary}>
                  {loading ? "Создание..." : "Создать"}
                </button>
              </div>
            )}

            {slots.map(s => (
              <button key={s.id} onClick={() => { setSelectedSlotId(s.id); setTab("slot_detail"); }} className={`${cardClass} w-full text-left`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[#404243]">{s.restaurant}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.date} {s.time} | {s.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{s.current_bookings}/{s.max_people}</span>
                    <div className={`w-2.5 h-2.5 rounded-full ${s.is_active ? "bg-green-400" : "bg-red-400"}`} />
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* ===== ДЕТАЛИ МЕРОПРИЯТИЯ ===== */}
        {tab === "slot_detail" && selectedSlotId && (
          <>
            {renderHeader("Участники", "slots")}
            {(() => {
              const slot = slots.find(s => s.id === selectedSlotId);
              if (!slot) return null;
              return (
                <div className={`${cardClass} mb-4`}>
                  <div className="font-medium text-[#404243]">{slot.restaurant}</div>
                  <div className="text-xs text-gray-400 mt-1">{slot.date} {slot.time} | {slot.city}</div>
                  <div className="text-xs text-gray-400">Мест: {slot.current_bookings}/{slot.max_people}</div>
                  <button onClick={() => handleToggleSlotActive(slot)} className={`mt-2 text-xs px-3 py-1.5 rounded-full ${slot.is_active ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                    {slot.is_active ? "Деактивировать" : "Активировать"}
                  </button>
                </div>
              );
            })()}

            <div className="text-xs text-gray-400 mb-2">Участники ({participants.length}):</div>
            {participants.length === 0 && <div className="text-sm text-gray-400 text-center py-4">Нет участников</div>}
            {participants.map(p => (
              <div key={p.booking_id} className={cardClass}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[#404243]">{p.name || "Без имени"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">ID: {p.user_id}</div>
                    {p.telegram && <div className="text-xs text-gray-400">TG: {p.telegram}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`text-xs px-2 py-1 rounded-full ${p.paid ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {p.paid ? `Оплачено ${p.payment_amount || ""}` : "Не оплачено"}
                    </div>
                    <div className="text-[10px] text-gray-300">{p.booking_status}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ===== ГРУППЫ ===== */}
        {tab === "groups" && (
          <>
            {renderHeader("Группы", "dashboard")}
            <div className="flex gap-2 mb-4">
              <input placeholder="Название группы" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className={`${inputClass} flex-1`} />
              <button onClick={handleCreateGroup} className="bg-[#E15859] text-white rounded-xl px-4 flex-shrink-0">
                <Plus size={18} />
              </button>
            </div>

            {groups.map(g => (
              <div key={g.id} className={`${cardClass} flex items-center gap-3`}>
                <button onClick={() => { setSelectedGroupId(g.id); setTab("group_detail"); }} className="flex-1 text-left">
                  <div className="font-medium text-[#404243]">{g.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{g.member_count} участников</div>
                </button>
                <button onClick={() => handleDeleteGroup(g.id)} className="w-8 h-8 flex items-center justify-center text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {groups.length === 0 && <div className="text-sm text-gray-400 text-center py-4">Нет групп</div>}
          </>
        )}

        {/* ===== ДЕТАЛИ ГРУППЫ ===== */}
        {tab === "group_detail" && selectedGroupId && (
          <>
            {renderHeader(groups.find(g => g.id === selectedGroupId)?.name || "Группа", "groups")}
            <div className="flex gap-2 mb-4">
              <input placeholder="ID через запятую" value={addMemberIds} onChange={e => setAddMemberIds(e.target.value)} className={`${inputClass} flex-1`} />
              <button onClick={handleAddMembers} className="bg-[#E15859] text-white rounded-xl px-4 flex-shrink-0">
                <Plus size={18} />
              </button>
            </div>

            <div className="text-xs text-gray-400 mb-2">Участники ({groupMembers.length}):</div>
            {groupMembers.map(m => (
              <div key={m.user_id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <div className="font-medium text-[#404243]">{m.name || "Без имени"}</div>
                  <div className="text-xs text-gray-400">ID: {m.user_id} {m.telegram ? `| TG: ${m.telegram}` : ""}</div>
                </div>
                <button onClick={() => handleRemoveMember(m.user_id)} className="w-8 h-8 flex items-center justify-center text-red-400">
                  <X size={16} />
                </button>
              </div>
            ))}
            {groupMembers.length === 0 && <div className="text-sm text-gray-400 text-center py-4">Нет участников</div>}
          </>
        )}

        {/* ===== РАССЫЛКА ===== */}
        {tab === "broadcast" && (
          <>
            {renderHeader("Рассылка", "dashboard")}

            <div className={cardClass}>
              <div className="text-sm font-medium text-[#404243] mb-2">Получатели:</div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setBroadcastTarget("groups")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${broadcastTarget === "groups" ? "bg-[#E15859] text-white" : "bg-gray-100 text-gray-500"}`}>
                  По группам
                </button>
                <button onClick={() => setBroadcastTarget("slot")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${broadcastTarget === "slot" ? "bg-[#E15859] text-white" : "bg-gray-100 text-gray-500"}`}>
                  По мероприятию
                </button>
              </div>

              {broadcastTarget === "groups" && (
                <div className="flex flex-col gap-1.5 mb-3">
                  {groups.map(g => (
                    <button key={g.id} onClick={() => {
                      setBroadcastGroupIds(prev => prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]);
                    }} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${broadcastGroupIds.includes(g.id) ? "bg-[#E15859]/10 text-[#E15859]" : "bg-gray-50 text-gray-500"}`}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${broadcastGroupIds.includes(g.id) ? "border-[#E15859] bg-[#E15859]" : "border-gray-300"}`}>
                        {broadcastGroupIds.includes(g.id) && <Check size={12} className="text-white" />}
                      </div>
                      {g.name} ({g.member_count})
                    </button>
                  ))}
                </div>
              )}

              {broadcastTarget === "slot" && (
                <div className="flex flex-col gap-1.5 mb-3">
                  {slots.filter(s => s.is_active).map(s => (
                    <button key={s.id} onClick={() => setBroadcastSlotId(s.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${broadcastSlotId === s.id ? "bg-[#E15859]/10 text-[#E15859]" : "bg-gray-50 text-gray-500"}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${broadcastSlotId === s.id ? "border-[#E15859] bg-[#E15859]" : "border-gray-300"}`}>
                        {broadcastSlotId === s.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      {s.restaurant} | {s.date} {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={cardClass}>
              <div className="text-sm font-medium text-[#404243] mb-2">Текст сообщения:</div>
              <textarea
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                placeholder="Введите текст рассылки..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <button onClick={handleBroadcast} disabled={loading || !broadcastText.trim()} className={`${btnPrimary} flex items-center justify-center gap-2`}>
              <Send size={16} /> {loading ? "Отправка..." : "Отправить"}
            </button>

            {broadcastResult && (
              <div className={`${cardClass} mt-3`}>
                <div className="text-sm font-medium text-[#404243]">Результат:</div>
                <div className="text-sm text-green-600 mt-1">Отправлено: {broadcastResult.sent}</div>
                {broadcastResult.failed > 0 && <div className="text-sm text-red-500">Ошибок: {broadcastResult.failed}</div>}
                {broadcastResult.errors.length > 0 && (
                  <div className="mt-1 text-xs text-gray-400 max-h-20 overflow-y-auto">
                    {broadcastResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

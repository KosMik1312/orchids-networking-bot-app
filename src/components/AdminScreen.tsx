"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Users, Calendar, UsersRound, Send, BarChart3, Plus, Trash2, ChevronRight, Check, X, RefreshCw, ChevronLeft, ChevronDown, ChevronUp, Grid, CreditCard, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  checkAdmin, getAdminStats, getAdminUsers, getAdminSlots, createAdminSlot,
  updateAdminSlot, getSlotParticipants, getAdminGroups, createAdminGroup,
  deleteAdminGroup, getGroupMembers, addGroupMembers, removeGroupMember,
  sendBroadcast, getAdminUserProfile, getAdminPromotions, createAdminPromotion,
  updateAdminPromotion, deleteAdminPromotion, checkDeleteSlot, deleteSlot,
  checkDeletePromotion, deletePromotionHard,
  type AdminStats, type AdminUser, type AdminSlot, type SlotParticipant,
  type AdminGroup, type GroupMember, type BroadcastResult, type AdminUserProfile,
  type AdminPromotion
} from "@/lib/adminApi";
import { AdminUserProfileScreen } from "./AdminUserProfileScreen";
import { AdminPaymentsScreen } from "./AdminPaymentsScreen";
import { Tag } from "lucide-react";

type AdminTab = "dashboard" | "users" | "slots" | "slot_detail" | "groups" | "group_detail" | "broadcast" | "user_profile" | "promotions" | "payments";

interface AdminScreenProps {
  token: string;
  onBack?: () => void;
  isAuthorized?: boolean;
  mockStats?: AdminStats;
  mockUsers?: AdminUser[];
  mockSlots?: AdminSlot[];
  mockGroups?: AdminGroup[];
  initialTab?: AdminTab;
}

// --- Вспомогательные компоненты для красивой формы ---

const cardClass = "bg-white rounded-2xl p-4 shadow-sm mb-3";
const btnPrimary = "bg-[#E15859] text-white rounded-2xl px-4 py-3 font-medium text-sm w-full";
const btnSecondary = "bg-white border border-[#E15859] text-[#E15859] rounded-2xl px-4 py-2 font-medium text-sm";
const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E15859]";

const AdminSelect = ({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (v: string) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={value ? "text-[#404243]" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className="w-full px-4 py-3 text-sm text-[#404243] hover:bg-gray-50 text-left transition-colors flex items-center justify-between"
              >
                {opt}
                {value === opt && <Check size={14} className="text-[#E15859]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminCalendar = ({ value, onChange, onClose }: { value: string, onChange: (v: string) => void, onClose: () => void }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = [];
  const firstDay = (firstDayOfMonth(year, month) + 6) % 7;
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth(year, month); i++) days.push(i);

  const isSelected = (d: number) => {
    const formatted = `${d.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
    return value === formatted;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 w-[280px]"
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={18} /></button>
        <div className="text-sm font-bold text-[#404243]">{monthNames[month]} {year}</div>
        <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => (
          <div key={d} className="text-[10px] font-bold text-gray-300 text-center uppercase">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {d && (
              <button
                onClick={() => {
                  const formatted = `${d.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
                  onChange(formatted);
                  onClose();
                }}
                className={`w-full h-full text-xs rounded-lg transition-all flex items-center justify-center ${isSelected(d) ? "bg-[#E15859] text-white font-bold" : "text-[#404243] hover:bg-red-50 hover:text-[#E15859]"}`}
              >
                {d}
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full mt-4 py-2 text-xs font-medium text-gray-400 hover:text-[#E15859] transition-colors">Закрыть</button>
    </motion.div>
  );
};

const AdminDialog = ({
  isOpen,
  title,
  message,
  type,
  inputValue,
  onClose,
  onConfirm
}: {
  isOpen: boolean,
  title: string,
  message: string,
  type: "confirm" | "prompt",
  inputValue?: string,
  onClose: () => void,
  onConfirm: (val?: string) => void
}) => {
  const [val, setVal] = useState(inputValue || "");
  useEffect(() => { if (isOpen) setVal(inputValue || ""); }, [isOpen, inputValue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-6 shadow-2xl w-full max-w-[320px] pointer-events-auto"
            >
              <h3 className="text-[#E15859] text-lg font-bold mb-2">{title}</h3>
              <p className="text-[#404243] text-sm mb-4 leading-relaxed">{message}</p>

              {type === "prompt" && (
                <input
                  autoFocus
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className={`${inputClass} mb-6`}
                  placeholder="Введите значение..."
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 text-[#404243] font-medium text-sm transition-colors hover:bg-gray-200"
                >
                  Отмена
                </button>
                <button
                  onClick={() => { onConfirm(type === "prompt" ? val : undefined); onClose(); }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#E15859] text-white font-medium text-sm transition-colors shadow-lg shadow-[#E15859]/20 hover:opacity-90"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export function AdminScreen({ token: initData, onBack, isAuthorized: isAuthorizedProp, mockStats, mockUsers, mockSlots, mockGroups, initialTab = "dashboard" }: AdminScreenProps) {
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [previousTab, setPreviousTab] = useState<AdminTab | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<AdminUserProfile | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(isAuthorizedProp ?? null);
  const [stats, setStats] = useState<AdminStats | null>(mockStats || null);
  const [users, setUsers] = useState<AdminUser[]>(mockUsers || []);
  const [usersTotal, setUsersTotal] = useState(mockUsers?.length || 0);
  const [usersPage, setUsersPage] = useState(0);
  const [slots, setSlots] = useState<AdminSlot[]>(mockSlots || []);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<SlotParticipant[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>(mockGroups || []);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<AdminPromotion | null>(null);
  const [promoForm, setPromoForm] = useState({
    title: "",
    description: "",
    target_audience: "",
    price: "",
    quantity: "1",
    validity_days: "30"
  });

  const [editingSlot, setEditingSlot] = useState<AdminSlot | null>(null);

  // Custom Dialog State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "confirm" | "prompt";
    inputValue?: string;
    onConfirm: (val?: string) => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm",
    onConfirm: () => { },
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialog({ isOpen: true, title, message, type: "confirm", onConfirm });
  };

  const openPrompt = (title: string, message: string, defaultValue: string, onConfirm: (val: string) => void) => {
    setDialog({ isOpen: true, title, message, type: "prompt", inputValue: defaultValue, onConfirm: (v) => onConfirm(v || "") });
  };

  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: "", time: "", city: "Москва", restaurant: "", max_people: "", price: "10" });
  const [showCalendar, setShowCalendar] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [addMemberIds, setAddMemberIds] = useState("");

  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"groups" | "slot" | "all">("groups");
  const [broadcastGroupIds, setBroadcastGroupIds] = useState<number[]>([]);
  const [broadcastSlotId, setBroadcastSlotId] = useState<number | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);

  // Selection for grouping
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    if (isAuthorizedProp !== undefined) return;
    checkAdmin(initData)
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false));
  }, [initData, isAuthorizedProp]);

  const loadStats = useCallback(async () => {
    try {
      const s = await getAdminStats(initData);
      setStats(s);
    } catch (e: any) { setError(e.message); }
  }, [initData]);

  const loadUsers = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await getAdminUsers(initData, 50, page * 50);
      setUsers(res.users);
      setUsersTotal(res.total);
      setUsersPage(page);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [initData]);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSlots(initData);
      setSlots(res.slots);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [initData]);

  const loadParticipants = useCallback(async (slotId: number) => {
    setLoading(true);
    try {
      const res = await getSlotParticipants(initData, slotId);
      setParticipants(res.participants);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [initData]);

  const loadGroups = useCallback(async (slotId?: number) => {
    setLoading(true);
    try {
      const res = await getAdminGroups(initData, slotId);
      setGroups(res.groups);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [initData]);

  const loadGroupMembers = useCallback(async (groupId: number) => {
    setLoading(true);
    try {
      const res = await getGroupMembers(initData, groupId);
      setGroupMembers(res.members);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [initData]);

  const loadAdminPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPromotions(initData);
      setPromotions(res.promotions);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [initData]);

  useEffect(() => {
    if (authorized) loadStats();
  }, [authorized, loadStats]);

  useEffect(() => {
    if (tab === "users") loadUsers(0);
    if (tab === "slots") loadSlots();
    if (tab === "broadcast") loadSlots();
    if (tab === "promotions") loadAdminPromotions();
  }, [tab, loadUsers, loadSlots, loadAdminPromotions]);

  useEffect(() => {
    if (tab === "broadcast" && broadcastTarget === "groups" && broadcastSlotId) {
      loadGroups(broadcastSlotId);
    }
  }, [tab, broadcastTarget, broadcastSlotId, loadGroups]);

  useEffect(() => {
    if (selectedSlotId && tab === "slot_detail") {
      loadParticipants(selectedSlotId);
      loadGroups(selectedSlotId);
    }
  }, [selectedSlotId, tab, loadParticipants, loadGroups]);

  useEffect(() => {
    if (selectedGroupId && tab === "group_detail") loadGroupMembers(selectedGroupId);
  }, [selectedGroupId, tab, loadGroupMembers]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFF7EF" }}>
        <div className="text-[#404243] text-lg">Проверка доступа...</div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: "#FFF7EF" }}>
        <div className="text-[#E15859] text-xl font-bold">Нет доступа</div>
        <div className="text-[#404243] text-center">Откройте админ-панель через команду /admin в боте.</div>
        {onBack && (
          <button onClick={onBack} className="mt-4 px-6 py-3 bg-[#E15859] text-white rounded-2xl font-medium">Назад</button>
        )}
      </div>
    );
  }

  const handleCreateSlot = async () => {
    if (!slotForm.date || !slotForm.time || !slotForm.city || !slotForm.restaurant || !slotForm.max_people || !slotForm.price) return;
    setLoading(true);
    try {
      if (editingSlot) {
        await updateAdminSlot(initData, editingSlot.id, { ...slotForm, max_people: parseInt(slotForm.max_people), price: parseInt(slotForm.price) });
        setEditingSlot(null);
      } else {
        await createAdminSlot(initData, { ...slotForm, max_people: parseInt(slotForm.max_people), price: parseInt(slotForm.price) });
      }
      setShowSlotForm(false);
      setSlotForm({ date: "", time: "", city: "Москва", restaurant: "", max_people: "", price: "10" });
      await loadSlots();
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const handleToggleSlotActive = async (slot: AdminSlot) => {
    try {
      await updateAdminSlot(initData, slot.id, { is_active: !slot.is_active });
      await loadSlots();
    } catch (e: any) { setError(e.message); }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createAdminGroup(initData, newGroupName.trim());
      setNewGroupName("");
      await loadGroups();
    } catch (e: any) { setError(e.message); }
  };

  const handleDeleteGroup = async (groupId: number) => {
    openConfirm(
      "Удаление группы",
      "Вы уверены, что хотите окончательно удалить эту команду? Это действие нельзя отменить.",
      async () => {
        try {
          await deleteAdminGroup(initData, groupId);
          setSelectedGroupId(null);
          setTab("slot_detail");
          if (selectedSlotId) await loadGroups(selectedSlotId);
        } catch (e: any) { setError(e.message); }
      }
    );
  };

  const handleManualGrouping = async () => {
    if (selectedUserIds.length === 0 || !selectedSlotId) return;
    openPrompt(
      "Название команды",
      "Введите уникальное название для новой команды:",
      "",
      async (groupName) => {
        if (!groupName.trim()) return;
        setLoading(true);
        try {
          const g = await createAdminGroup(initData, groupName.trim(), selectedSlotId);
          await addGroupMembers(initData, g.id, selectedUserIds);
          setSelectedUserIds([]);
          await loadGroups(selectedSlotId);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
      }
    );
  };


  const handleAddMembers = async () => {
    if (!selectedGroupId || !addMemberIds.trim()) return;
    const ids = addMemberIds.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (ids.length === 0) return;
    try {
      await addGroupMembers(initData, selectedGroupId, ids);
      setAddMemberIds("");
      await loadGroupMembers(selectedGroupId);
    } catch (e: any) { setError(e.message); }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroupId) return;
    try {
      await removeGroupMember(initData, selectedGroupId, userId);
      await loadGroupMembers(selectedGroupId);
    } catch (e: any) { setError(e.message); }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setLoading(true);
    setBroadcastResult(null);
    try {
      const data: any = { text: broadcastText };
      if (broadcastTarget === "all") data.all_users = true;
      if (broadcastTarget === "groups" && broadcastGroupIds.length > 0) data.group_ids = broadcastGroupIds;
      if (broadcastTarget === "slot" && broadcastSlotId) data.slot_id = broadcastSlotId;
      if (!data.all_users && !data.group_ids && !data.slot_id) {
        setError("Выберите получателей");
        setLoading(false);
        return;
      }
      const result = await sendBroadcast(initData, data);
      setBroadcastResult(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    if (!promoForm.title || !promoForm.price) return;
    setLoading(true);
    try {
      if (editingPromo) {
        await updateAdminPromotion(initData, editingPromo.id, {
          ...promoForm,
          price: parseInt(promoForm.price),
          quantity: parseInt(promoForm.quantity),
          validity_days: parseInt(promoForm.validity_days)
        });
        setEditingPromo(null);
      } else {
        await createAdminPromotion(initData, {
          ...promoForm,
          price: parseInt(promoForm.price),
          quantity: parseInt(promoForm.quantity),
          validity_days: parseInt(promoForm.validity_days)
        });
      }
      setShowPromoForm(false);
      setPromoForm({ title: "", description: "", target_audience: "", price: "", quantity: "1", validity_days: "30" });
      await loadAdminPromotions();
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const handleTogglePromoActive = async (promo: AdminPromotion) => {
    try {
      if (promo.is_active) {
        await deleteAdminPromotion(initData, promo.id);
      } else {
        await updateAdminPromotion(initData, promo.id, { is_active: true });
      }
      await loadAdminPromotions();
    } catch (e: any) { setError(e.message); }
  };

  const renderHeader = (title: string, backTo?: AdminTab) => (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={() => backTo ? setTab(backTo) : undefined} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <ArrowLeft size={20} className="text-[#404243]" />
      </button>
      <h1 className="text-[#E15859] text-xl font-bold uppercase tracking-tight">{title}</h1>
    </div>
  );

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
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
                { icon: CreditCard, label: "Платежи", t: "payments" as AdminTab },
                { icon: Tag, label: "Акции и спецпредложения", t: "promotions" as AdminTab },
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
              <div 
                key={u.user_id} 
                className={`${cardClass} cursor-pointer hover:border-[#E15859] border-2 border-transparent transition-colors`}
                onClick={async () => {
                   setLoading(true);
                   try {
                       const profile = await getAdminUserProfile(initData, u.user_id);
                       setSelectedUserProfile(profile);
                       setPreviousTab("users");
                       setTab("user_profile");
                   } catch (e: any) {
                       setError(e.message || "Ошибка загрузки профиля");
                   } finally {
                       setLoading(false);
                   }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[#404243] flex items-center gap-1">
                        {u.name || "Без имени"}
                        <ChevronRight size={14} className="text-[#E15859]" />
                    </div>
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

        {/* ===== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ===== */}
        {tab === "user_profile" && selectedUserProfile && (
            <AdminUserProfileScreen 
                userMap={selectedUserProfile} 
                onBack={() => {
                    setSelectedUserProfile(null);
                    setTab(previousTab || "users");
                }} 
            />
        )}

        {/* ===== МЕРОПРИЯТИЯ ===== */}
        {tab === "slots" && (
          <>
            {renderHeader("Мероприятия", "dashboard")}
            <button onClick={() => setShowSlotForm(!showSlotForm)} className={`${btnPrimary} mb-4 flex items-center justify-center gap-2`}>
              <Plus size={18} /> Создать мероприятие
            </button>

            {showSlotForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className={`${cardClass} border-2 border-[#E15859]/10 bg-white/50 backdrop-blur-sm flex flex-col gap-3`}>
                  <div className="text-xs font-bold text-[#E15859] uppercase tracking-wider mb-1">{editingSlot ? "Редактирование мероприятия" : "Новое мероприятие"}</div>

                  <div className="relative">
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={`${inputClass} flex items-center justify-between text-left`}
                    >
                      <span className={slotForm.date ? "text-[#404243]" : "text-gray-400"}>
                        {slotForm.date || "Выберите дату"}
                      </span>
                      <Calendar size={16} className="text-gray-400" />
                    </button>
                    <AnimatePresence>
                      {showCalendar && (
                        <div className="absolute z-[60] mt-2 left-0 top-full">
                          <AdminCalendar
                            value={slotForm.date}
                            onChange={(v) => setSlotForm(p => ({ ...p, date: v }))}
                            onClose={() => setShowCalendar(false)}
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input placeholder="Время (ЧЧ:ММ)" value={slotForm.time} onChange={e => setSlotForm(p => ({ ...p, time: e.target.value }))} className={inputClass} />

                  <AdminSelect
                    value={slotForm.city}
                    options={["Москва", "Санкт-Петербург"]}
                    onChange={(v) => setSlotForm(p => ({ ...p, city: v }))}
                    placeholder="Выберите город"
                  />

                  <input placeholder="Место / Адрес" value={slotForm.restaurant} onChange={e => setSlotForm(p => ({ ...p, restaurant: e.target.value }))} className={inputClass} />
                  <div className="flex gap-2">
                    <input placeholder="Макс. мест" type="number" value={slotForm.max_people} onChange={e => setSlotForm(p => ({ ...p, max_people: e.target.value }))} className={`${inputClass} flex-1`} />
                    <input placeholder="Стоимость (₽)" type="number" value={slotForm.price} onChange={e => setSlotForm(p => ({ ...p, price: e.target.value }))} className={`${inputClass} flex-1`} />
                  </div>

                  <button onClick={handleCreateSlot} disabled={loading} className={`${btnPrimary} mt-2 shadow-lg shadow-[#E15859]/20`}>
                    {loading ? "Сохранение..." : editingSlot ? "Сохранить изменения" : "Создать мероприятие"}
                  </button>
                  {editingSlot && (
                    <button onClick={() => {
                      setEditingSlot(null);
                      setSlotForm({ date: "", time: "", city: "Москва", restaurant: "", max_people: "", price: "10" });
                      setShowSlotForm(false);
                    }} className="py-2 text-sm text-gray-400 hover:text-[#E15859] transition-colors">
                      Отменить редактирование
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {slots.map(s => (
              <div key={s.id} className={`${cardClass} w-full`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-[#404243]">{s.restaurant}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.date} {s.time} | {s.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E15859] mr-2">{s.price} ₽</span>
                    <span className="text-xs text-gray-400">{s.current_bookings}/{s.max_people}</span>
                    <div className={`w-2.5 h-2.5 rounded-full ${s.is_active ? "bg-green-400" : "bg-red-400"}`} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedSlotId(s.id); setTab("slot_detail"); }} className="flex-1 py-2 px-3 rounded-xl bg-gray-50 text-[#404243] text-xs font-medium hover:bg-gray-100 transition-colors">
                    Участники
                  </button>
                  <button onClick={() => {
                    setEditingSlot(s);
                    setSlotForm({
                      date: s.date,
                      time: s.time,
                      city: s.city,
                      restaurant: s.restaurant,
                      max_people: s.max_people.toString(),
                      price: s.price.toString()
                    });
                    setShowSlotForm(true);
                  }} className="py-2 px-3 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1">
                    <Edit size={14} /> Изменить
                  </button>
                  <button onClick={async () => {
                    try {
                      const check = await checkDeleteSlot(initData, s.id);
                      const hasData = check.active_bookings > 0 || check.paid_payments > 0;
                      openConfirm(
                        "Удаление мероприятия",
                        hasData 
                          ? `⚠️ У этого мероприятия есть ${check.active_bookings} активных бронирований и ${check.paid_payments} оплаченных платежей. Вы уверены, что хотите удалить?`
                          : "Вы уверены, что хотите удалить это мероприятие?",
                        async () => {
                          try {
                            await deleteSlot(initData, s.id);
                            await loadSlots();
                          } catch (e: any) { setError(e.message); }
                        }
                      );
                    } catch (e: any) { setError(e.message); }
                  }} className="py-2 px-3 rounded-xl bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1">
                    <Trash2 size={14} /> Удалить
                  </button>
                  <button onClick={() => handleToggleSlotActive(s)} className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors ${s.is_active ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    {s.is_active ? "Деактивировать" : "Активировать"}
                  </button>
                </div>
              </div>
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
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleToggleSlotActive(slot)} className={`text-xs px-3 py-1.5 rounded-full ${slot.is_active ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                      {slot.is_active ? "Деактивировать" : "Активировать"}
                    </button>
                    <button onClick={() => setSelectedUserIds(prev => prev.length === participants.length ? [] : participants.map(p => p.user_id))} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                      {selectedUserIds.length === participants.length ? "Снять выбор" : "Выбрать всех"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {participants.length > 0 && (
              <div className={`${cardClass} border-2 border-dashed border-[#E15859]/20 bg-[#E15859]/5`}>
                <div className="text-xs font-bold text-[#E15859] uppercase tracking-wider mb-2">Группировка</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleManualGrouping}
                    disabled={selectedUserIds.length === 0 || loading}
                    className={`${btnPrimary} !w-auto !py-2 !px-4 !text-xs flex items-center gap-1 disabled:opacity-50`}
                  >
                    <Users size={14} /> Создать команду из выбранных ({selectedUserIds.length})
                  </button>
                </div>
              </div>
            )}

            {groups.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">Команды ({groups.length}):</div>
                <div className="flex flex-col gap-2">
                  {groups.map(g => (
                    <button key={g.id} onClick={() => { setSelectedGroupId(g.id); setTab("group_detail"); }} className={`${cardClass} w-full text-left flex justify-between items-center !mb-0`}>
                      <div>
                        <div className="font-medium text-[#404243]">{g.name}</div>
                        <div className="text-xs text-gray-400 mt-1">Участников: {g.member_count}</div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 mb-2">Участники ({participants.length}):</div>
            {participants.length === 0 && <div className="text-sm text-gray-400 text-center py-4">Нет участников</div>}
            {participants.map(p => (
              <label key={p.user_id} className={`${cardClass} flex items-center gap-3 cursor-pointer hover:border-[#E15859]/30 transition-colors`}>
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(p.user_id)}
                  onChange={() => setSelectedUserIds(prev => prev.includes(p.user_id) ? prev.filter(id => id !== p.user_id) : [...prev, p.user_id])}
                  className="w-4 h-4 accent-[#E15859]"
                />
                  <div 
                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={async (e) => {
                      e.preventDefault(); // Prevent label click
                      setLoading(true);
                      try {
                        const profile = await getAdminUserProfile(initData, p.user_id);
                        setSelectedUserProfile(profile);
                        setPreviousTab("slot_detail");
                        setTab("user_profile");
                      } catch (e: any) {
                        setError(e.message || "Ошибка загрузки профиля");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <div className="font-medium text-[#404243] hover:text-[#E15859] transition-colors">{p.name || "Без имени"}</div>
                    <div className="text-xs text-gray-400 mt-1">TG: {p.telegram || "—"} | Оплата: {p.paid ? "✅" : "⏳"}</div>
                  </div>
                  <div className="text-xs bg-gray-50 px-2 py-1 rounded text-gray-500">{p.booking_status}</div>
              </label>
            ))}
          </>
        )}

        {/* ===== ГРУППЫ ===== */}
        {tab === "groups" && (
          <>
            {renderHeader("Группы", "dashboard")}
            <div className={`${cardClass} flex gap-2`}>
              <input placeholder="Название группы" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className={inputClass} />
              <button onClick={handleCreateGroup} className={`${btnPrimary} !w-auto !px-6`}><Plus size={20} /></button>
            </div>
            {groups.map(g => (
              <button key={g.id} onClick={() => { setSelectedGroupId(g.id); setTab("group_detail"); }} className={`${cardClass} w-full text-left flex justify-between items-center`}>
                <div>
                  <div className="font-medium text-[#404243]">{g.name}</div>
                  <div className="text-xs text-gray-400 mt-1">Участников: {g.member_count}</div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </>
        )}

        {/* ===== ДЕТАЛИ ГРУППЫ ===== */}
        {tab === "group_detail" && selectedGroupId && (
          <>
            {renderHeader("Управление группой", "groups")}
            <div className={cardClass}>
              <div className="text-sm font-medium text-[#404243] mb-2">Добавить участников (через запятую ID):</div>
              <div className="flex gap-2">
                <input placeholder="123, 456, 789" value={addMemberIds} onChange={e => setAddMemberIds(e.target.value)} className={inputClass} />
                <button onClick={handleAddMembers} className={`${btnPrimary} !w-auto !px-6`}>Добавить</button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2 px-1">
              <div className="text-xs text-gray-400">Участники группы:</div>
              <button onClick={() => handleDeleteGroup(selectedGroupId)} className="text-xs text-red-400 flex items-center gap-1">
                <Trash2 size={12} /> Удалить группу
              </button>
            </div>
            {groupMembers.map(m => (
              <div key={m.user_id} className={`${cardClass} flex justify-between items-center`}>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity flex-1"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const profile = await getAdminUserProfile(initData, m.user_id);
                      setSelectedUserProfile(profile);
                      setPreviousTab("group_detail");
                      setTab("user_profile");
                    } catch (e: any) {
                      setError(e.message || "Ошибка загрузки профиля");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div className="text-sm font-medium text-[#404243] hover:text-[#E15859] transition-colors">{m.name || "Без имени"}</div>
                  <div className="text-xs text-gray-400">ID: {m.user_id} | TG: {m.telegram || "—"}</div>
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
              <div className="flex gap-2 mb-3 flex-wrap">
                <button onClick={() => setBroadcastTarget("all")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${broadcastTarget === "all" ? "bg-[#E15859] text-white" : "bg-gray-100 text-gray-500"}`}>
                  Всем пользователям
                </button>
                <button onClick={() => setBroadcastTarget("groups")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${broadcastTarget === "groups" ? "bg-[#E15859] text-white" : "bg-gray-100 text-gray-500"}`}>
                  По группам
                </button>
                <button onClick={() => setBroadcastTarget("slot")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${broadcastTarget === "slot" ? "bg-[#E15859] text-white" : "bg-gray-100 text-gray-500"}`}>
                  По мероприятию
                </button>
              </div>

              {broadcastTarget === "all" && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-yellow-50 text-yellow-700 text-sm">
                  ⚠️ Сообщение будет отправлено всем зарегистрированным пользователям
                </div>
              )}

              {broadcastTarget === "groups" && (
                <div className="flex flex-col gap-3 mb-3">
                  <div className="text-xs text-gray-400">1. Выберите мероприятие:</div>
                  <div className="flex flex-col gap-1.5">
                    {slots.filter(s => s.is_active).map(s => (
                      <button key={s.id} onClick={() => setBroadcastSlotId(s.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${broadcastSlotId === s.id ? "bg-[#E15859]/10 text-[#E15859]" : "bg-gray-50 text-gray-500"}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${broadcastSlotId === s.id ? "border-[#E15859] bg-[#E15859]" : "border-gray-300"}`}>
                          {broadcastSlotId === s.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        {s.restaurant} | {s.date} {s.time}
                      </button>
                    ))}
                  </div>

                  {broadcastSlotId && (
                    <>
                      <div className="text-xs text-gray-400 mt-2">2. Выберите команды для рассылки:</div>
                      {groups.length === 0 ? (
                        <div className="text-sm text-gray-400 py-2">Нет команд для этого мероприятия</div>
                      ) : (
                        <div className="flex flex-col gap-1.5 mb-1">
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
                    </>
                  )}
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
                {broadcastResult.status === 'started' && (
                  <>
                    <div className="text-sm text-green-600 mt-1">✅ Рассылка запущена</div>
                    <div className="text-sm text-gray-600 mt-1">Получателей: {broadcastResult.target_count}</div>
                    <div className="text-xs text-gray-400 mt-2 italic">Сообщения отправляются в фоновом режиме</div>
                  </>
                )}
                {broadcastResult.status === 'no_recipients' && (
                  <div className="text-sm text-yellow-600 mt-1">⚠️ Не найдено получателей</div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* ===== АКЦИИ ===== */}
      {tab === "promotions" && (
        <>
          {renderHeader("Акции и предложения", "dashboard")}
          <button onClick={() => setShowPromoForm(!showPromoForm)} className={`${btnPrimary} mb-4 flex items-center justify-center gap-2`}>
            <Plus size={18} /> Добавить акцию
          </button>

          {showPromoForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className={`${cardClass} border-2 border-[#E15859]/10 bg-white/50 backdrop-blur-sm flex flex-col gap-3`}>
                <div className="text-xs font-bold text-[#E15859] uppercase tracking-wider mb-1">{editingPromo ? "Редактирование акции" : "Новая акция"}</div>
                <input placeholder="Название (например: Подписка для пар)" value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
                <textarea placeholder="Описание" value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none`} rows={3} />
                <input placeholder="Для кого (целевая аудитория)" value={promoForm.target_audience} onChange={e => setPromoForm(p => ({ ...p, target_audience: e.target.value }))} className={inputClass} />
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1 ml-1">Цена (₽)</div>
                    <input placeholder="7500" type="number" value={promoForm.price} onChange={e => setPromoForm(p => ({ ...p, price: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1 ml-1">Посещений</div>
                    <input placeholder="5" type="number" value={promoForm.quantity} onChange={e => setPromoForm(p => ({ ...p, quantity: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1 ml-1">Срок (дней)</div>
                    <input placeholder="60" type="number" value={promoForm.validity_days} onChange={e => setPromoForm(p => ({ ...p, validity_days: e.target.value }))} className={inputClass} />
                  </div>
                </div>

                <button onClick={handleCreatePromotion} disabled={loading} className={`${btnPrimary} mt-2 shadow-lg shadow-[#E15859]/20`}>
                  {loading ? "Сохранение..." : editingPromo ? "Сохранить изменения" : "Создать акцию"}
                </button>
                {editingPromo && (
                  <button onClick={() => {
                    setEditingPromo(null);
                    setPromoForm({ title: "", description: "", target_audience: "", price: "", quantity: "1", validity_days: "30" });
                    setShowPromoForm(false);
                  }} className="py-2 text-sm text-gray-400 hover:text-[#E15859] transition-colors">
                    Отменить редактирование
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {promotions.length === 0 && !loading && (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <Tag size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-gray-400 text-sm">Акций пока нет</p>
            </div>
          )}

          <div className="space-y-3 pb-4">
            {promotions.map(p => (
              <div key={p.id} className={cardClass}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-[#404243]">{p.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#E15859]">{p.price} ₽</div>
                    <div className={`text-[10px] font-bold uppercase mt-1 ${p.is_active ? 'text-green-500' : 'text-gray-300'}`}>
                      {p.is_active ? 'Активна' : 'Неактивна'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><UsersRound size={12} /> {p.quantity} визитов</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.validity_days} дн.</span>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      setEditingPromo(p);
                      setPromoForm({
                        title: p.title,
                        description: p.description,
                        target_audience: p.target_audience || "",
                        price: p.price.toString(),
                        quantity: p.quantity.toString(),
                        validity_days: p.validity_days.toString()
                      });
                      setShowPromoForm(true);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <Edit size={12} /> Изменить
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const check = await checkDeletePromotion(initData, p.id);
                        openConfirm(
                          "Удаление акции",
                          check.total_purchases > 0
                            ? `⚠️ Эту акцию купили ${check.total_purchases} раз. Вы уверены, что хотите удалить?`
                            : "Вы уверены, что хотите удалить эту акцию?",
                          async () => {
                            try {
                              await deletePromotionHard(initData, p.id);
                              await loadAdminPromotions();
                            } catch (e: any) { setError(e.message); }
                          }
                        );
                      } catch (e: any) { setError(e.message); }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} /> Удалить
                  </button>
                  <button 
                    onClick={() => handleTogglePromoActive(p)}
                    className={`flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${p.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  >
                    {p.is_active ? 'Деактивировать' : 'Активировать'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== ПЛАТЕЖИ ===== */}
      {tab === "payments" && (
        <AdminPaymentsScreen token={initData} onBack={() => setTab("dashboard")} />
      )}

      <AdminDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        inputValue={dialog.inputValue}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
}

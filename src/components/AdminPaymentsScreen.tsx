"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminPayments,
  getAdminPaymentDetail,
  getAdminPaymentStats,
  type AdminPayment,
  type AdminPaymentDetail,
  type AdminPaymentStats
} from "@/lib/adminApi";

type PaymentTab = "list" | "detail" | "stats";
type PaymentFilter = "all" | "succeeded" | "pending" | "failed" | "created" | "expired" | "refunded";

interface AdminPaymentsScreenProps {
  token: string;
  onBack: () => void;
}

const cardClass = "bg-white rounded-2xl p-4 shadow-sm mb-3";
const btnSecondary = "bg-white border border-[#E15859] text-[#E15859] rounded-2xl px-4 py-2 font-medium text-sm";

// Цветовая индикация статусов
const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  succeeded: { label: "Успешно", color: "text-green-700", icon: CheckCircle, bg: "bg-green-50 border-green-200" },
  pending: { label: "Ожидает", color: "text-yellow-700", icon: Clock, bg: "bg-yellow-50 border-yellow-200" },
  created: { label: "Создан", color: "text-blue-700", icon: Clock, bg: "bg-blue-50 border-blue-200" },
  failed: { label: "Ошибка", color: "text-red-700", icon: XCircle, bg: "bg-red-50 border-red-200" },
  canceled: { label: "Отменён", color: "text-gray-700", icon: XCircle, bg: "bg-gray-50 border-gray-200" },
  expired: { label: "Истёк", color: "text-gray-700", icon: AlertCircle, bg: "bg-gray-50 border-gray-200" },
  refunded: { label: "Возврат", color: "text-purple-700", icon: RefreshCw, bg: "bg-purple-50 border-purple-200" },
};

export function AdminPaymentsScreen({ token, onBack }: AdminPaymentsScreenProps) {
  const [tab, setTab] = useState<PaymentTab>("list");
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentDetail | null>(null);
  const [stats, setStats] = useState<AdminPaymentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async (page = 0, statusFilter?: string) => {
    setLoading(true);
    try {
      const res = await getAdminPayments(
        token,
        statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        50,
        page * 50
      );
      setPayments(res.payments);
      setPaymentsTotal(res.total);
      setPaymentsPage(page);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  const loadPaymentDetail = useCallback(async (paymentId: number) => {
    setLoading(true);
    try {
      const detail = await getAdminPaymentDetail(token, paymentId);
      setSelectedPayment(detail);
      setTab("detail");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const statsData = await getAdminPaymentStats(token);
      setStats(statsData);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (tab === "list") {
      loadPayments(0, filter);
    } else if (tab === "stats") {
      loadStats();
    }
  }, [tab, filter, loadPayments, loadStats]);

  const renderHeader = (title: string, backAction?: () => void) => (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={backAction || onBack}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
      >
        <ArrowLeft size={20} className="text-[#404243]" />
      </button>
      <h1 className="text-[#E15859] text-xl font-bold uppercase tracking-tight">{title}</h1>
    </div>
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `${amount} ₽`;
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      <div className="flex-1 flex flex-col px-5 pt-10 pb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex justify-between items-center">
            <span className="text-red-600 text-sm">{error}</span>
            <button onClick={() => setError(null)}>
              <XCircle size={16} className="text-red-400" />
            </button>
          </div>
        )}

        {/* ===== СПИСОК ПЛАТЕЖЕЙ ===== */}
        {tab === "list" && (
          <>
            {renderHeader("💳 Платежи")}

            {/* Статистика (краткая) */}
            <button
              onClick={() => setTab("stats")}
              className={`${cardClass} flex items-center justify-between mb-4`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#E15859] rounded-full flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-[#404243]">Статистика</div>
                  <div className="text-xs text-gray-400">Выручка, конверсия, средний чек</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>

            {/* Фильтры */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {(["all", "succeeded", "pending", "created", "failed", "expired"] as PaymentFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filter === f
                      ? "bg-[#E15859] text-white shadow-lg shadow-[#E15859]/20"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {f === "all" ? "Все" : statusConfig[f]?.label || f}
                </button>
              ))}
            </div>

            {/* Список платежей */}
            <div className="text-xs text-gray-400 mb-3">Всего: {paymentsTotal}</div>
            {loading && payments.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Загрузка...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Нет платежей</div>
            ) : (
              <>
                {payments.map((payment) => {
                  const config = statusConfig[payment.status] || statusConfig.created;
                  const StatusIcon = config.icon;

                  return (
                    <button
                      key={payment.id}
                      onClick={() => loadPaymentDetail(payment.id)}
                      className={`${cardClass} w-full text-left hover:border-[#E15859] border-2 border-transparent transition-colors`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-[#404243] flex items-center gap-2">
                            {payment.user_name || "Без имени"}
                            <span className="text-xs text-gray-400">#{payment.id}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID пользователя: {payment.user_id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#E15859] text-lg">
                            {formatAmount(payment.amount)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg}`}
                        >
                          <StatusIcon size={12} className={config.color} />
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(payment.created_at)}
                        </div>
                      </div>

                      {/* Предупреждение если нет брони */}
                      {payment.status === "succeeded" && !payment.booking_id && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded-lg">
                          <AlertCircle size={14} />
                          <span>Бронирование не создано!</span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Пагинация */}
                {paymentsTotal > 50 && (
                  <div className="flex gap-2 justify-center mt-4">
                    {paymentsPage > 0 && (
                      <button
                        onClick={() => loadPayments(paymentsPage - 1, filter)}
                        className={btnSecondary}
                      >
                        Назад
                      </button>
                    )}
                    {(paymentsPage + 1) * 50 < paymentsTotal && (
                      <button
                        onClick={() => loadPayments(paymentsPage + 1, filter)}
                        className={btnSecondary}
                      >
                        Далее
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ===== ДЕТАЛИ ПЛАТЕЖА ===== */}
        {tab === "detail" && selectedPayment && (
          <>
            {renderHeader(`Платёж #${selectedPayment.id}`, () => setTab("list"))}

            <div className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-[#E15859]">
                  {formatAmount(selectedPayment.amount)}
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                    statusConfig[selectedPayment.status]?.bg || "bg-gray-50"
                  }`}
                >
                  {(() => {
                    const config = statusConfig[selectedPayment.status] || statusConfig.created;
                    const StatusIcon = config.icon;
                    return (
                      <>
                        <StatusIcon size={14} className={config.color} />
                        <span className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Информация о пользователе */}
              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="text-xs text-gray-400 mb-1">Пользователь</div>
                <div className="font-medium text-[#404243]">{selectedPayment.user_name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  ID: {selectedPayment.user_id}
                  {selectedPayment.user_telegram && ` • TG: ${selectedPayment.user_telegram}`}
                </div>
              </div>

              {/* Информация о слоте */}
              {selectedPayment.slot_info && (
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <div className="text-xs text-gray-400 mb-1">Мероприятие</div>
                  <div className="font-medium text-[#404243]">
                    {selectedPayment.slot_info.restaurant}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {selectedPayment.slot_info.date} {selectedPayment.slot_info.time} •{" "}
                    {selectedPayment.slot_info.city}
                  </div>
                </div>
              )}

              {/* Информация о бронировании */}
              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="text-xs text-gray-400 mb-1">Бронирование</div>
                {selectedPayment.booking_id ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-sm text-[#404243]">
                      ID: {selectedPayment.booking_id} • Статус: {selectedPayment.booking_status}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={14} />
                    <span className="text-sm">Бронирование не создано</span>
                  </div>
                )}
              </div>

              {/* Технические данные */}
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-400 mb-2">Технические данные</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">YooKassa ID:</span>
                    <span className="text-[#404243] font-mono text-[10px]">
                      {selectedPayment.yookassa_payment_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Создан:</span>
                    <span className="text-[#404243]">{formatDate(selectedPayment.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Обновлён:</span>
                    <span className="text-[#404243]">{formatDate(selectedPayment.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== СТАТИСТИКА ===== */}
        {tab === "stats" && (
          <>
            {renderHeader("📊 Статистика платежей", () => setTab("list"))}

            {loading && !stats ? (
              <div className="text-center py-10 text-gray-500">Загрузка...</div>
            ) : stats ? (
              <>
                {/* Основные метрики */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={cardClass}>
                    <div className="text-2xl font-bold text-[#404243]">
                      {stats.total_revenue.toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Общая выручка</div>
                  </div>
                  <div className={cardClass}>
                    <div className="text-2xl font-bold text-[#404243]">{stats.total_payments}</div>
                    <div className="text-xs text-gray-400 mt-1">Всего платежей</div>
                  </div>
                  <div className={cardClass}>
                    <div className="text-2xl font-bold text-[#404243]">
                      {stats.conversion_rate}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Конверсия</div>
                  </div>
                  <div className={cardClass}>
                    <div className="text-2xl font-bold text-[#404243]">
                      {stats.average_payment.toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Средний чек</div>
                  </div>
                </div>

                {/* Разбивка по статусам */}
                <div className={cardClass}>
                  <div className="text-sm font-bold text-[#404243] mb-3">Разбивка по статусам</div>
                  <div className="space-y-2">
                    {Object.entries(stats.status_breakdown).map(([status, count]) => {
                      const config = statusConfig[status] || statusConfig.created;
                      const StatusIcon = config.icon;
                      const percentage =
                        stats.total_payments > 0
                          ? ((count / stats.total_payments) * 100).toFixed(1)
                          : "0";

                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon size={14} className={config.color} />
                            <span className="text-sm text-[#404243]">{config.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#404243]">{count}</span>
                            <span className="text-xs text-gray-400">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

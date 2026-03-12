"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Settings, ChevronRight, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { getSlots, createBooking, createPayment, getPaymentStatus } from "@/lib/api";
import { ru } from "@/lib/i18n/ru";

type BookingStep = "slots" | "payment" | "success";

interface Slot {
  id: number;
  date: string;
  time: string;
  address: string;
  price: number;
}

interface BookingScreenProps {
  city?: string;
  authToken?: string | null;
  selectedEventId?: number | null;
  onBack?: () => void;
  onComplete?: () => void;
  onPromotions?: () => void;
  onAfisha?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onContacts?: () => void;
  onOffer?: () => void;
}

export function BookingScreen({ city = "Москва", authToken, selectedEventId, onBack, onComplete, onPromotions, onAfisha, onProfile, onSettings, onContacts, onOffer }: BookingScreenProps) {
  const t = ru.booking;
  const [step, setStep] = useState<BookingStep>("slots");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [acceptedOffer, setAcceptedOffer] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Функция для проверки статуса платежа с polling
  const checkPaymentStatus = async (paymentId: number, effectiveToken: string, maxRetries = 20) => {
    console.log("🔍 [PAYMENT] Checking payment status:", String(paymentId).replace(/[\r\n]/g, ""));
    setIsCheckingPayment(true);

    let retries = 0;
    const pollInterval = setInterval(async () => {
      retries++;
      
      try {
        const payment = await getPaymentStatus(paymentId, effectiveToken);
        console.log("💳 [PAYMENT] Status check result:", payment?.status ? String(payment.status).replace(/[\r\n]/g, "") : "unknown");

        if (payment.status === "succeeded") {
          console.log("✅ [PAYMENT] Payment succeeded! Finalizing booking...");
          clearInterval(pollInterval);
          
          // 🎯 КРИТИЧНО: Вызываем финализацию бронирования
          try {
            const finalizeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://antreclub-app.ru'}/api/bookings/finalize`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveToken}`
              },
              body: JSON.stringify({ paymentId })
            });

            if (!finalizeResponse.ok) {
              throw new Error('Failed to finalize booking');
            }

            const finalizeData = await finalizeResponse.json();
            console.log("✅ [PAYMENT] Booking finalized:", finalizeData);
          } catch (finalizeError) {
            console.error("❌ [PAYMENT] Finalize booking error:", finalizeError);
            // Продолжаем показывать success, т.к. webhook/scheduler подстрахуют
          }

          setIsCheckingPayment(false);
          setStep("success");
          localStorage.removeItem("orchids_pending_payment_id");
          localStorage.removeItem("orchids_pending_payment_time");
          sessionStorage.removeItem('orchids_auth_token');
          sessionStorage.removeItem('orchids_slot_id');
          return;
        } else if (payment.status === "failed" || payment.status === "canceled") {
          console.log("❌ [PAYMENT] Payment failed or canceled");
          clearInterval(pollInterval);
          setIsCheckingPayment(false);
          setPaymentError("Платёж не прошел. Пожалуйста, попробуйте снова.");
          localStorage.removeItem("orchids_pending_payment_id");
          sessionStorage.removeItem('orchids_auth_token');
          sessionStorage.removeItem('orchids_slot_id');
          return;
        }
        // Если pending - продолжаем polling
      } catch (err) {
        console.error("❌ [PAYMENT] Error checking payment status:", err instanceof Error ? err.message : "unknown error");
      }

      // Если превышено количество попыток - останавливаем polling
      if (retries >= maxRetries) {
        console.log("⏱️ [PAYMENT] Polling timeout, showing warning");
        clearInterval(pollInterval);
        setIsCheckingPayment(false);
        setPaymentError("Не удалось подтвердить платёж. Пожалуйста, проверьте статус вручную.");
        // Не удаляем paymentId - может понадобиться для ручной проверки
      }
    }, 1500); // Проверяем каждые 1.5 секунды (быстрее для лучшего UX)
    
    // Возвращаем функцию очистки для предотвращения memory leak
    return () => clearInterval(pollInterval);
  };

  useEffect(() => {
    // 🎯 ГЛАВНАЯ ЛОГИКА: Проверка после возврата с платёжной страницы
    const params = new URLSearchParams(window.location.search);
    const paymentIdFromUrl = params.get("payment_id");

    // 🔐 ВОССТАНАВЛИВАЕМ authToken из sessionStorage если его нет
    let effectiveAuthToken = authToken;
    if (!effectiveAuthToken && paymentIdFromUrl) {
      const savedToken = sessionStorage.getItem('orchids_auth_token');
      if (savedToken) {
        console.log('🔐 [PAYMENT] Restored auth token from sessionStorage');
        effectiveAuthToken = savedToken;
      }
    }

    // Проверяем статус платежа ТОЛЬКО если в URL есть payment_id (возврат с платежной страницы)
    if (paymentIdFromUrl && effectiveAuthToken) {
      console.log("💰 [PAYMENT] Payment return detected, checking status...");
      console.log("  From URL:", String(paymentIdFromUrl).replace(/[\r\n]/g, ""));
      
      const cleanup = checkPaymentStatus(parseInt(paymentIdFromUrl), effectiveAuthToken);
      
      // Очищаем URL от параметра payment_id
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("payment_id");
      window.history.replaceState({}, "", newUrl.toString());
      
      // Возвращаем функцию очистки для остановки polling при размонтировании
      return () => {
        cleanup?.then(clearFn => clearFn?.());
      };
    } else if (paymentIdFromUrl && !effectiveAuthToken) {
      console.error("❌ [PAYMENT] Payment return detected but no auth token available!");
      setPaymentError("Ошибка аутентификации. Пожалуйста, попробуйте снова.");
      setStep("slots");
    } else {
      // Обычный вход в приложение - показываем список мероприятий
      setStep("slots");
    }
  }, []);
  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      try {
        setIsLoading(true);
        const data = await getSlots("all");
        if (isMounted) {
          const mappedSlots: Slot[] = data.slots.map((s: any) => ({
            id: s.id,
            date: new Date(s.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
            time: s.time,
            address: s.restaurant,
            city: s.city,
            price: s.price
          }));
          setSlots(mappedSlots);

          // Если передан ID конкретного события, выбираем его сразу
          if (selectedEventId) {
            const preSelected = mappedSlots.find(s => Number(s.id) === Number(selectedEventId));
            if (preSelected) {
              setSelectedSlot(preSelected);
              setStep("payment");
            }
          }
        }
      } catch (err) {
        if (isMounted) setError(t.error);
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSlots();
    return () => { isMounted = false; };
  }, [city, selectedEventId]);

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!selectedSlot || !authToken) return;
    
    try {
      setIsLoading(true);
      setPaymentError(null);

      // 🎯 КРИТИЧНО: Сохраняем authToken в sessionStorage ПЕРЕД редиректом
      // Это позволит восстановить аутентификацию после возврата с ЮКассы
      if (authToken) {
        sessionStorage.setItem('orchids_auth_token', authToken);
        sessionStorage.setItem('orchids_slot_id', selectedSlot.id.toString());
        console.log('💾 [PAYMENT] Saved auth token to sessionStorage');
      }

      // 🎯 ВАЖНО: Явно указываем returnUrl на свой домен
      // ЮКасса будет редиректить на этот URL после оплаты
      const returnUrl = "https://antreclub-app.ru/?payment_id={paymentId}";

      console.log("💳 [PAYMENT] Initiating payment for slot:", selectedSlot.id);
      const paymentData = await createPayment({
        amount: selectedSlot.price ? selectedSlot.price.toString() : "10",
        slotId: selectedSlot.id,
        returnUrl: returnUrl
      }, authToken);

      if (paymentData.confirmationUrl && paymentData.paymentId) {
        // 🎯 КРИТИЧНО: Сохраняем paymentId в localStorage ПЕРЕД редиректом
        // Это гарантирует, что при возврате мы сможем проверить статус платежа
        localStorage.setItem("orchids_pending_payment_id", String(paymentData.paymentId));
        localStorage.setItem("orchids_pending_payment_time", Date.now().toString());
        
        console.log("💾 [PAYMENT] Saved payment ID to localStorage:", paymentData.paymentId);
        console.log("🚀 [PAYMENT] Redirecting to YooKassa:", paymentData.confirmationUrl);

        // 🎯 ВАЖНО: Используем tg.WebApp.openLink() чтобы открыть Yookassa в браузере
        // Это избегает X-Frame-Options блокировки (Yookassa не грузится в фрейме)
        // initData сохранится в параметрах URL и будет доступен при возврате
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp as any;
          if (typeof tg.openLink === 'function') {
            tg.openLink(paymentData.confirmationUrl);
          } else {
            window.location.href = paymentData.confirmationUrl;
          }
        } else {
          // Fallback для браузера (не в Telegram)
          window.location.href = paymentData.confirmationUrl;
        }
      } else {
        console.log("❌ [PAYMENT] Invalid payment response");
        setPaymentError("Ошибка создания платежа. Пожалуйста, попробуйте снова.");
      }
    } catch (e: any) {
      console.error("❌ [PAYMENT] Payment flow failed:", e);
      setPaymentError(e.message || "Ошибка при обработке платежа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    onComplete?.();
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      <AnimatePresence mode="wait">
        {/* Step 1: Slot Selection */}
        {step === "slots" && (
          <motion.div
            key="slots"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-6 pb-32"
          >
            {/* Location & Settings */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
                <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={22} fill="white" />
                </div>
                <span className="font-medium text-[#404243] text-[15px] pr-2">Все города</span>
              </div>
              <button onClick={onSettings} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Settings className="text-[#E15859]" size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Dining Image */}
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[140px] mb-4">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="text-[#E15859] text-[26px] font-black uppercase text-center tracking-tight leading-none mb-4" style={{ fontFamily: "system-ui, sans-serif" }}>
              {t.title}
            </h2>

            {/* Slots List */}
            <div className="space-y-3 flex-1">
              {isLoading ? (
                <div className="text-center py-10 text-gray-500">{t.loading}</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">{error}</div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 text-gray-500">{t.noSlots}</div>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-[18px] bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="text-left">
                      <p className="text-[#404243] text-[16px] font-semibold">{slot.date}, {slot.time}</p>
                      <p className="text-[#8E8E93] text-[12px] mt-0">{slot.address}</p>
                    </div>
                    <div className="w-11 h-11 bg-[#E15859] rounded-full flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="text-white" size={22} />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Promo Button */}
            <button
              onClick={onPromotions}
              className="w-full py-3 rounded-[20px] bg-[#E15859] text-white text-[16px] font-semibold mt-4"
            >
              {t.promotionsButton}
            </button>

            {/* Contacts Button */}
            <button
              onClick={onContacts}
              className="w-full py-3 rounded-[20px] bg-[#E15859] text-white text-[16px] font-semibold mt-2"
            >
              {t.contactsButton}
            </button>
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-6"
          >
            {/* Location & Settings (dimmed) */}
            <div className="flex justify-between items-center mb-3 opacity-50">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
                <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={22} fill="white" />
                </div>
                <span className="font-medium text-[#404243] text-[15px] pr-2">Все города</span>
              </div>
              <button onClick={onSettings} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Settings className="text-[#E15859]" size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Dining Image with overlay */}
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[160px] mb-0 relative">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-t-[32px] -mt-6 px-5 py-4 flex-1 relative z-10">
              {/* Date & Time */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <p className="text-[#404243] text-[12px] font-medium">{t.payment.date}</p>
                <p className="text-[#E15859] text-[17px] font-bold mt-0.5">{selectedSlot?.date || "07.11.25"}, {selectedSlot?.time || "18:00"}</p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <p className="text-[#404243] text-[12px] font-medium">{t.payment.location}</p>
                <p className="text-[#E15859] text-[17px] font-bold mt-0.5 line-clamp-1">{(selectedSlot as any)?.city || city}, {selectedSlot?.address || "ул. Скляренко д. 2"}</p>
              </div>

              {/* Promo Code */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.payment.promoPlaceholder}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-[#E0E0E0] rounded-full px-4 py-2 text-[13px] focus:outline-none focus:border-[#E15859]"
                  />
                  <button className="w-14 h-[38px] bg-[#E15859] rounded-[14px] flex items-center justify-center">
                    <Check className="text-white" size={18} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#404243] text-[14px] font-medium">{t.payment.total}</span>
                <span className="text-[#2A2021] text-[18px] font-bold">{selectedSlot?.price || 10} ₽</span>
              </div>

              {/* Info Text */}
              <p className="text-[9px] text-[#404243] leading-[1.3] mb-3 opacity-70">
                {t.payment.refundPolicy}
              </p>

              {/* Offer Checkbox */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setAcceptedOffer(!acceptedOffer)}
                  className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${acceptedOffer ? "bg-[#E15859] border-[#E15859]" : "border-[#D1D1D1]"}`}
                >
                  {acceptedOffer && <Check className="text-white" size={13} strokeWidth={3} />}
                </button>
                <button
                  onClick={onOffer}
                  className="text-[#404243] text-[12px] underline text-left"
                >
                  {t.payment.acceptOffer}
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {paymentError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3 p-3 rounded-[16px] bg-[#E15859]/10 border border-[#E15859]/20 flex items-start gap-3"
                  >
                    <AlertCircle className="text-[#E15859] flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1">
                      <p className="text-[#E15859] text-[12px] font-medium leading-[1.4]">
                        {paymentError}
                      </p>
                      <button
                        onClick={() => setPaymentError(null)}
                        className="text-[#E15859] text-[10px] font-bold uppercase mt-0.5 opacity-70"
                      >
                        Закрыть
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* Pay Button */}
                <button
                  disabled={!acceptedOffer || isLoading}
                  onClick={handlePayment}
                  className={`w-full py-3 rounded-[20px] text-[16px] font-semibold transition-all active:scale-[0.98] shadow-sm ${acceptedOffer && !isLoading ? "bg-[#E15859] text-white" : "bg-[#E15859]/40 text-white/60 cursor-not-allowed"
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Подождите...</span>
                    </div>
                  ) : t.payment.payButton}
                </button>

                {/* Back Button */}
                <button
                  onClick={() => setStep("slots")}
                  className="w-full py-3 rounded-[20px] bg-[#FFF7EF] border-2 border-[#E15859]/20 text-[#E15859] font-semibold text-[16px] transition-all active:scale-95 shadow-sm"
                >
                  {t.payment.backButton || "Назад"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col px-6 pb-32"
          >
            {/* Location & Settings (dimmed) */}
            <div className="flex justify-between items-center mb-3 opacity-50">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
                <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={22} fill="white" />
                </div>
                <span className="font-medium text-[#404243] text-[15px] pr-2">Все города</span>
              </div>
              <button onClick={onSettings} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Settings className="text-[#E15859]" size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Dining Image */}
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[160px] mb-4">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="text-[#BDBDBD] text-[26px] font-black uppercase text-center tracking-tight leading-none mb-3" style={{ fontFamily: "system-ui, sans-serif" }}>
              {t.success.titleGray}
            </h2>

            {/* Success Card */}
            <div className="bg-white rounded-[24px] px-5 py-5 flex-1">
              <h3 className="text-[#E15859] text-[24px] font-black uppercase text-center tracking-tight mb-4">
                {t.success.successTitle}
              </h3>

              {/* Date */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <p className="text-[#404243] text-[12px] font-medium">{t.payment.date}</p>
                <p className="text-[#E15859] text-[17px] font-bold mt-0.5">{selectedSlot?.date || "07.11.25"}</p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <p className="text-[#404243] text-[12px] font-medium">{t.payment.location}</p>
                <p className="text-[#E15859] text-[17px] font-bold mt-0.5">{(selectedSlot as any)?.city || city}, {selectedSlot?.address || "-"}</p>
              </div>

              {/* Time */}
              <div className="border-b border-gray-100 pb-2 mb-4">
                <p className="text-[#404243] text-[12px] font-medium">{t.success.time}</p>
                <p className="text-[#E15859] text-[17px] font-bold mt-0.5">{selectedSlot?.time || "18:00"}</p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-[20px] bg-[#E15859] text-white text-[16px] font-semibold"
              >
                {t.success.continueButton}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab="home" onTabChange={(tab) => {
        if (tab === "afisha") onAfisha?.();
        if (tab === "profile") onProfile?.();
      }} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Settings, ChevronRight, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { getSlots, createBooking, createPayment } from "@/lib/api";
import { ru } from "@/lib/i18n/ru";

type BookingStep = "slots" | "payment" | "success";

interface Slot {
  id: number;
  date: string;
  time: string;
  address: string;
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

  useEffect(() => {
    // Проверка возврата с оплаты
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      console.log("💰 [PAYMENT] Detected redirect back from success payment");
      setStep("success");
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
            city: s.city
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
      // 1. Создаем бронирование
      console.log("💳 [PAYMENT] Creating booking for slot:", selectedSlot.id);
      const bookingData = await createBooking(selectedSlot.id, authToken);

      if (!bookingData.success || !bookingData.bookingId) {
        throw new Error("Failed to create booking");
      }

      console.log("✅ [PAYMENT] Booking created:", bookingData.bookingId);

      // 2. Создаем платеж в Ю-Кассе
      // Формируем returnUrl так, чтобы вернуться на этот же экран с флагом успеха
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('payment_success', 'true');

      console.log("💳 [PAYMENT] Initiating YooMoney payment...");
      const paymentData = await createPayment({
        amount: "1500", // Фиксированная стоимость
        bookingId: bookingData.bookingId,
        returnUrl: currentUrl.toString()
      }, authToken);

      if (paymentData.confirmationUrl) {
        console.log("🚀 [PAYMENT] Redirecting to:", paymentData.confirmationUrl);
        window.location.href = paymentData.confirmationUrl;
      } else {
        console.log("✅ [PAYMENT] No confirmation needed, showing success");
        setStep("success");
      }
    } catch (e: any) {
      console.error("❌ [PAYMENT] Payment flow failed:", e);
      setPaymentError(e.message || t.errors.bookingFailed);
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
            <div className="flex justify-between items-center mb-6">
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
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[160px] mb-6">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
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
                    className="w-full flex items-center justify-between px-6 py-5 rounded-[20px] bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="text-left">
                      <p className="text-[#404243] text-[17px] font-semibold">{slot.date}, {slot.time}</p>
                      <p className="text-[#8E8E93] text-[13px] mt-0.5">{slot.address}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
                      <ChevronRight className="text-white" size={24} />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Promo Button */}
            <button
              onClick={onPromotions}
              className="w-full py-4 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-6"
            >
              {t.promotionsButton}
            </button>

            {/* Contacts Button */}
            <button
              onClick={onContacts}
              className="w-full py-4 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-3"
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
            <div className="flex justify-between items-center mb-6 opacity-50">
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
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[180px] mb-0 relative">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-t-[32px] -mt-6 px-6 py-6 flex-1 relative z-10">
              {/* Date & Time */}
              <div className="border-b border-gray-100 pb-3 mb-3">
                <p className="text-[#404243] text-[13px] font-medium">{t.payment.date}</p>
                <p className="text-[#E15859] text-[18px] font-bold mt-0.5">{selectedSlot?.date || "07.11.25"}, {selectedSlot?.time || "18:00"}</p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-100 pb-3 mb-3">
                <p className="text-[#404243] text-[13px] font-medium">{t.payment.location}</p>
                <p className="text-[#E15859] text-[18px] font-bold mt-0.5 line-clamp-1">{(selectedSlot as any)?.city || city}, {selectedSlot?.address || "ул. Скляренко д. 2"}</p>
              </div>

              {/* Promo Code */}
              <div className="border-b border-gray-100 pb-3 mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.payment.promoPlaceholder}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-[#E0E0E0] rounded-full px-4 py-3 text-[14px] focus:outline-none focus:border-[#E15859]"
                  />
                  <button className="w-16 bg-[#E15859] rounded-[14px] flex items-center justify-center">
                    <Check className="text-white" size={20} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#404243] text-[15px] font-medium">{t.payment.total}</span>
                <span className="text-[#2A2021] text-[20px] font-bold">1 500 ₽</span>
              </div>

              {/* Info Text */}
              <p className="text-[10px] text-[#404243] leading-[1.3] mb-4 opacity-70">
                {t.payment.refundPolicy}
              </p>

              {/* Offer Checkbox */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setAcceptedOffer(!acceptedOffer)}
                  className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${acceptedOffer ? "bg-[#E15859] border-[#E15859]" : "border-[#D1D1D1]"}`}
                >
                  {acceptedOffer && <Check className="text-white" size={14} strokeWidth={3} />}
                </button>
                <button
                  onClick={onOffer}
                  className="text-[#404243] text-[13px] underline text-left"
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
                    className="mb-4 p-4 rounded-[16px] bg-[#E15859]/10 border border-[#E15859]/20 flex items-start gap-3"
                  >
                    <AlertCircle className="text-[#E15859] flex-shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                      <p className="text-[#E15859] text-[13px] font-medium leading-[1.4]">
                        {paymentError}
                      </p>
                      <button
                        onClick={() => setPaymentError(null)}
                        className="text-[#E15859] text-[11px] font-bold uppercase mt-1 opacity-70"
                      >
                        Закрыть
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Back Button */}
                <button
                  onClick={() => setStep("slots")}
                  className="w-16 h-14 bg-[#FFF7EF] border border-[#E15859]/20 rounded-[20px] flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  <ArrowLeft className="text-[#E15859]" size={24} />
                </button>

                {/* Pay Button */}
                <button
                  disabled={!acceptedOffer || isLoading}
                  onClick={handlePayment}
                  className={`flex-1 py-4 rounded-[20px] text-[17px] font-semibold transition-all active:scale-[0.98] shadow-sm ${acceptedOffer && !isLoading ? "bg-[#E15859] text-white" : "bg-[#E15859]/40 text-white/60 cursor-not-allowed"
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Подождите...</span>
                    </div>
                  ) : t.payment.payButton}
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
            <div className="flex justify-between items-center mb-6 opacity-50">
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
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[180px] mb-6">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="text-[#BDBDBD] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-4" style={{ fontFamily: "system-ui, sans-serif" }}>
              {t.success.titleGray}
            </h2>

            {/* Success Card */}
            <div className="bg-white rounded-[24px] px-6 py-8 flex-1">
              <h3 className="text-[#E15859] text-[26px] font-black uppercase text-center tracking-tight mb-6">
                {t.success.successTitle}
              </h3>

              {/* Date */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium">{t.payment.date}</p>
                <p className="text-[#E15859] text-[20px] font-bold mt-1">{selectedSlot?.date || "07.11.25"}</p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium">{t.payment.location}</p>
                <p className="text-[#E15859] text-[20px] font-bold mt-1">{(selectedSlot as any)?.city || city}, {selectedSlot?.address || "-"}</p>
              </div>

              {/* Time */}
              <div className="border-b border-gray-100 pb-4 mb-6">
                <p className="text-[#404243] text-[15px] font-medium">{t.success.time}</p>
                <p className="text-[#E15859] text-[20px] font-bold mt-1">{selectedSlot?.time || "18:00"}</p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold"
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

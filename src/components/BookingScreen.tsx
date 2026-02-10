"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Settings, ChevronRight, Check } from "lucide-react";
import { BottomNav } from "./BottomNav";

type BookingStep = "slots" | "payment" | "success";

interface Slot {
  id: number;
  date: string;
  time: string;
  address: string;
}

interface BookingScreenProps {
  city?: string;
  onBack?: () => void;
  onComplete?: () => void;
  onPromotions?: () => void;
  onAfisha?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onContacts?: () => void;
}

export function BookingScreen({ city = "Москва", onBack, onComplete, onPromotions, onAfisha, onProfile, onSettings, onContacts }: BookingScreenProps) {
  const [step, setStep] = useState<BookingStep>("slots");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [acceptedOffer, setAcceptedOffer] = useState(false);

  const slots: Slot[] = [
    { id: 1, date: "7 января", time: "17:00", address: "Г. Москва, ул. Скляренко д. 2" },
    { id: 2, date: "7 января", time: "17:00", address: "Г. Москва, ул. Скляренко д. 2" },
  ];

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep("payment");
  };

  const handlePayment = () => {
    setStep("success");
  };

  const handleContinue = () => {
    onComplete?.();
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
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
                <span className="font-medium text-[#404243] text-[15px] pr-2">г. {city}</span>
              </div>
              <button onClick={onSettings} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-8 h-8 relative">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                    <circle cx="12" cy="12" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="20" cy="12" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="12" cy="20" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="20" cy="20" r="3" stroke="#E15859" strokeWidth="2" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Dining Image */}
            <div className="rounded-[24px] overflow-hidden shadow-lg h-[220px] mb-8">
              <img
                src="/images/dining.png"
                alt="Dining"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
              Бронирование ужина
            </h2>

            {/* Slots List */}
            <div className="space-y-3 flex-1">
              {slots.map((slot) => (
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
              ))}
            </div>

              {/* Promo Button */}
              <button
                onClick={onPromotions}
                className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-6"
              >
                Акции и предложения
              </button>

              {/* Contacts Button */}
              <button
                onClick={onContacts}
                className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-3"
              >
                Мои контакты
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
                <span className="font-medium text-[#404243] text-[15px] pr-2">г. {city}</span>
              </div>
              <button onClick={onSettings} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-8 h-8 relative">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                    <circle cx="12" cy="12" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="20" cy="12" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="12" cy="20" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="20" cy="20" r="3" stroke="#E15859" strokeWidth="2" />
                  </svg>
                </div>
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
            <div className="bg-white rounded-t-[32px] -mt-4 px-6 py-8 flex-1 relative z-10">
              {/* Date */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium">Дата</p>
                <p className="text-[#E15859] text-[22px] font-bold mt-1">07.11.25</p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium">Локация</p>
                <p className="text-[#E15859] text-[22px] font-bold mt-1">{selectedSlot?.address || "Г. Москва, ул. Скляренко д. 2"}</p>
              </div>

              {/* Promo Code */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium mb-3">Промокод</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Введите промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-[#E0E0E0] rounded-full px-5 py-4 text-[15px] focus:outline-none focus:border-[#E15859]"
                  />
                  <button className="w-24 bg-[#E15859] rounded-[18px] flex items-center justify-center">
                    <Check className="text-white" size={24} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#404243] text-[17px] font-medium">Итого</span>
                <span className="text-[#2A2021] text-[22px] font-bold">1 500 ₽</span>
              </div>

              {/* Info Text */}
              <p className="text-[11px] text-[#404243] leading-relaxed mb-3 opacity-70">
                Возврат средств возможен только в случае, если вы отмените до полуночи понедельника, предшествующего дня ужина.
              </p>
              <p className="text-[11px] text-[#404243] leading-relaxed mb-4 opacity-70">
                Нажимая на кнопку, вы даете согласие на <span className="underline">обработку персональных данных</span>, и соглашаетесь с <span className="underline">политикой конфиденциальности</span>
              </p>

              {/* Offer Checkbox */}
              <button
                onClick={() => setAcceptedOffer(!acceptedOffer)}
                className="flex items-center gap-3 mb-5"
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${acceptedOffer ? "bg-[#E15859] border-[#E15859]" : "border-[#D1D1D1]"}`}>
                  {acceptedOffer && <Check className="text-white" size={14} strokeWidth={3} />}
                </div>
                <span className="text-[#404243] text-[14px] underline">Я принимаю условия оферты</span>
              </button>

              {/* Pay Button */}
              <button
                disabled={!acceptedOffer}
                onClick={handlePayment}
                className={`w-full py-5 rounded-[20px] text-[17px] font-semibold transition-all ${acceptedOffer ? "bg-[#E15859] text-white" : "bg-[#E15859]/40 text-white/60 cursor-not-allowed"
                  }`}
              >
                Оплатить
              </button>
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
                <span className="font-medium text-[#404243] text-[15px] pr-2">г. {city}</span>
              </div>
              <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-8 h-8 relative">
                  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                    <circle cx="12" cy="12" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="20" cy="12" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="12" cy="20" r="3" stroke="#E15859" strokeWidth="2" />
                    <circle cx="20" cy="20" r="3" stroke="#E15859" strokeWidth="2" />
                  </svg>
                </div>
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
              Бронирование ужина
            </h2>

            {/* Success Card */}
            <div className="bg-white rounded-[24px] px-6 py-8 flex-1">
              <h3 className="text-[#E15859] text-[26px] font-black uppercase text-center tracking-tight mb-6">
                Успешно оплачено
              </h3>

              {/* Date */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium">Дата</p>
                <p className="text-[#E15859] text-[20px] font-bold mt-1">07.11.25</p>
              </div>

              {/* Location */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <p className="text-[#404243] text-[15px] font-medium">Локация</p>
                <p className="text-[#E15859] text-[20px] font-bold mt-1">{city}</p>
              </div>

              {/* Time */}
              <div className="border-b border-gray-100 pb-4 mb-6">
                <p className="text-[#404243] text-[15px] font-medium">Время</p>
                <p className="text-[#E15859] text-[20px] font-bold mt-1">{selectedSlot?.time || "18:00"}</p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold"
              >
                Продолжить
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

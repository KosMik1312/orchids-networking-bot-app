"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Settings, Clock, Check, Home, MessageCircle, User } from "lucide-react";

interface BookingFlowProps {
  onComplete: (bookingData: BookingData) => void;
  userCity: string;
}

export interface BookingData {
  date: string;
  time: string;
  dayOfWeek: string;
  city: string;
  price: number;
}

type Step = "slots" | "payment" | "success";

export function BookingFlow({ onComplete, userCity }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("slots");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  const slots = [
    { id: 1, date: "7 января", dayOfWeek: "Понедельник", time: "18:00" },
    { id: 2, date: "7 января", dayOfWeek: "Понедельник", time: "18:00" },
    { id: 3, date: "7 января", dayOfWeek: "Понедельник", time: "18:00" },
    { id: 4, date: "7 января", dayOfWeek: "Понедельник", time: "18:00" },
    { id: 5, date: "7 января", dayOfWeek: "Понедельник", time: "18:00" },
  ];

  const handleBook = () => {
    if (selectedSlot !== null) {
      setStep("payment");
    }
  };

  const handlePay = () => {
    if (isAgreed) {
      setStep("success");
    }
  };

  const handleFinish = () => {
    const slot = slots.find(s => s.id === selectedSlot);
    if (slot) {
      onComplete({
        date: slot.date,
        time: slot.time,
        dayOfWeek: slot.dayOfWeek,
        city: userCity,
        price: 1500
      });
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Top Header (Shared) */}
      <div className="flex items-center justify-between px-6 pt-12 shrink-0 z-10">
        <div className="flex items-center gap-2 bg-[#F3B7B8] bg-opacity-30 rounded-full px-4 py-2">
          <MapPin size={18} className="text-[#E15859]" />
          <span 
            className="text-[14px] font-medium text-[#404243] opacity-60"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {userCity || "г. Москва"}
          </span>
        </div>
        <div className="w-[44px] h-[44px] rounded-full bg-[#F3B7B8] bg-opacity-30 flex items-center justify-center">
          <Settings size={20} className="text-[#E15859]" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "slots" && (
          <motion.div
            key="slots"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center px-6 pt-4 relative overflow-y-auto pb-32"
          >
            {/* Dinner Image */}
            <div className="w-full h-[240px] rounded-[40px] overflow-hidden relative shadow-sm mb-6 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2074&auto=format&fit=crop" 
                alt="Dinner" 
                className="w-full h-full object-cover"
              />
            </div>

            <h2 
              className="text-[32px] font-black uppercase tracking-tight text-[#E15859] mb-6 text-center"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              БРОНИРОВАНИЕ УЖИНА
            </h2>

            <div className="w-full space-y-3 mb-8">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className="w-full h-[56px] rounded-full bg-white px-8 flex items-center justify-between transition-all active:scale-[0.98] shadow-sm"
                  style={{ 
                    backgroundColor: selectedSlot === slot.id ? "#E15859" : "white"
                  }}
                >
                  <span 
                    className="text-[14px] font-medium"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: selectedSlot === slot.id ? "white" : "#404243"
                    }}
                  >
                    {slot.date}
                  </span>
                  <span 
                    className="text-[14px] font-medium"
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: selectedSlot === slot.id ? "white" : "#404243"
                    }}
                  >
                    {slot.dayOfWeek}
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: selectedSlot === slot.id ? "white" : "#F3B7B8", opacity: selectedSlot === slot.id ? 1 : 0.3 }}
                    >
                      <Clock size={14} style={{ color: selectedSlot === slot.id ? "#E15859" : "white" }} />
                    </div>
                    <span 
                      className="text-[14px] font-medium"
                      style={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        color: selectedSlot === slot.id ? "white" : "#404243"
                      }}
                    >
                      {slot.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Button and Navigation */}
            <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-[#E9E9E9] via-[#E9E9E9] to-transparent">
              <button
                onClick={handleBook}
                className="h-[64px] w-full rounded-full text-[18px] font-bold transition-all active:scale-[0.98] mb-6 shadow-lg"
                style={{
                  backgroundColor: selectedSlot === null ? "rgba(225, 88, 89, 0.3)" : "#E15859",
                  color: "white",
                  fontFamily: "'Montserrat', sans-serif",
                }}
                disabled={selectedSlot === null}
              >
                Забронировать
              </button>

              {/* Bottom Nav Bar */}
              <div className="flex justify-around items-center bg-white rounded-full py-3 shadow-sm">
                <div className="flex flex-col items-center gap-1 text-[#E15859]">
                  <Home size={20} />
                  <span className="text-[10px] font-medium">Главная</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#404243] opacity-40">
                  <MessageCircle size={20} />
                  <span className="text-[10px] font-medium">Контакты</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#404243] opacity-40">
                  <User size={20} />
                  <span className="text-[10px] font-medium">Профиль</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center px-6 pt-4 relative"
          >
            {/* Background Image (faded) */}
            <div className="absolute top-4 left-6 right-6 h-[240px] rounded-[40px] overflow-hidden opacity-30 -z-10">
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2074&auto=format&fit=crop" 
                alt="Dinner" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Payment Card */}
            <div 
              className="w-full rounded-[40px] bg-white p-8 shadow-sm flex flex-col mt-[120px] mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <div className="space-y-6">
                <div>
                  <p className="text-[14px] text-[#404243] font-medium mb-1 opacity-60">Дата</p>
                  <p className="text-[20px] font-bold text-[#E15859]">07.11.25</p>
                </div>
                
                <div className="w-full h-px bg-[#404243] opacity-10" />

                <div>
                  <p className="text-[14px] text-[#404243] font-medium mb-1 opacity-60">Локация</p>
                  <p className="text-[20px] font-bold text-[#E15859]">{userCity.replace('г. ', '')}</p>
                </div>

                <div className="w-full h-px bg-[#404243] opacity-10" />

                <div>
                  <p className="text-[14px] text-[#404243] font-medium mb-3 opacity-60">Промокод</p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 h-[56px] rounded-full border border-[#404243] border-opacity-20 px-6 text-[14px] focus:outline-none focus:border-[#E15859]"
                    />
                    <button className="w-[80px] h-[56px] rounded-full bg-[#E15859] flex items-center justify-center text-white">
                      <Check size={24} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-[#404243] opacity-10" />

                <div className="flex justify-between items-center">
                  <p className="text-[18px] text-[#404243] font-bold">Итого</p>
                  <p className="text-[20px] font-black text-[#000000]">1 500 ₽</p>
                </div>

                <p className="text-[10px] leading-[1.4] text-[#404243] opacity-60 italic">
                  Возврат средств возможен только в случае, если вы отмените до полуночи понедельника, предшествующего дню ужина.
                  <br /><br />
                  Нажимая на кнопку, вы даете согласие на обработку персональных данных, и соглашаетесь с политикой конфиденциальности
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isAgreed ? 'bg-[#E15859] border-[#E15859]' : 'border-[#E15859]'}`}>
                      {isAgreed && <Check size={16} className="text-white" strokeWidth={4} />}
                    </div>
                  </div>
                  <span className="text-[14px] font-medium text-[#404243]">Я принимаю <span className="underline">условия оферты</span></span>
                </label>

                <button
                  onClick={handlePay}
                  className="h-[64px] w-full rounded-full text-[18px] font-bold transition-all active:scale-[0.98] mt-4"
                  style={{
                    backgroundColor: !isAgreed ? "rgba(225, 88, 89, 0.3)" : "#E15859",
                    color: "white",
                  }}
                  disabled={!isAgreed}
                >
                  Оплатить
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6 relative"
          >
             <div 
              className="w-full rounded-[40px] bg-white p-10 shadow-sm flex flex-col items-center text-center"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <div className="w-20 h-20 rounded-full bg-[#E15859] flex items-center justify-center mb-6">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>
              
              <h3 className="text-[28px] font-black uppercase tracking-tight text-[#E15859] mb-4">
                УСПЕШНО ОПЛАЧЕНО
              </h3>
              
              <p className="text-[16px] text-[#404243] font-medium mb-8">
                Ваше место за ужином забронировано. Детали отправлены вам в сообщении.
              </p>

              <div className="w-full bg-[#E9E9E9] rounded-2xl p-4 mb-8 text-left space-y-2">
                <p className="text-[14px]"><b>Дата:</b> 07.11.25</p>
                <p className="text-[14px]"><b>Время:</b> 18:00</p>
                <p className="text-[14px]"><b>Город:</b> {userCity.replace('г. ', '')}</p>
              </div>

              <button
                onClick={handleFinish}
                className="h-[64px] w-full rounded-full text-[18px] font-bold bg-[#E15859] text-white transition-all active:scale-[0.98]"
              >
                Продолжить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

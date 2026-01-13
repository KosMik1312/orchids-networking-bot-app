"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Settings, 
  Clock, 
  ChevronRight, 
  Check, 
  ArrowLeft,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { BottomNav } from "./BottomNav";

type BookingStep = "booking" | "payment" | "success";

interface BookingFlowProps {
  city: string;
  onBack: () => void;
}

export function BookingFlow({ city, onBack }: BookingFlowProps) {
  const [step, setStep] = useState<BookingStep>("booking");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [acceptedOffer, setAcceptedOffer] = useState(false);

  const slots = [
    { id: 1, date: "7 января", day: "Понедельник", time: "18:00" },
    { id: 2, date: "7 января", day: "Понедельник", time: "18:00" },
    { id: 3, date: "7 января", day: "Понедельник", time: "18:00" },
    { id: 4, date: "7 января", day: "Понедельник", time: "18:00" },
  ];

  const handleBack = () => {
    if (step === "booking") {
      onBack();
    } else if (step === "payment") {
      setStep("booking");
    } else {
      setStep("payment");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      <AnimatePresence mode="wait">
        {step === "booking" && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col pb-24"
          >
            {/* Top Controls */}
            <div className="px-6 flex justify-between items-center mb-6 mt-4">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm">
                <div className="w-10 h-10 bg-[#E15859] rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={20} fill="white" />
                </div>
                  <span className="font-semibold text-[#404243] pr-2">
                    {city ? (city.startsWith("г.") ? city : `г. ${city}`) : "г. Москва"}
                  </span>
              </div>
              <button className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Settings className="text-[#E15859]" size={24} />
              </button>
            </div>

            {/* Dining Image */}
            <div className="px-6 mb-8">
              <div className="rounded-[32px] overflow-hidden shadow-lg h-[240px] relative">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/eca39e85-e059-4463-8b02-d72196908069/55-resized-1768289316561.webp?width=8000&height=8000&resize=contain" 
                  alt="Dining" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Title */}
            <div className="px-6 mb-6">
              <h2 className="text-[#E15859] text-[34px] font-black uppercase text-center tracking-tight leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Бронирование ужина
              </h2>
            </div>

            {/* Slots List */}
            <div className="px-6 space-y-3 overflow-y-auto max-h-[40vh] mb-4">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-full transition-all ${
                    selectedSlot === slot.id 
                      ? "bg-[#E15859] text-white shadow-md scale-[1.02]" 
                      : "bg-white text-[#404243] shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-8 flex-1">
                    <span className="font-medium min-w-[80px] text-left">{slot.date}</span>
                    <span className="text-sm opacity-80">{slot.day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedSlot === slot.id ? "bg-white/20" : "border border-[#E15859]/20"}`}>
                      <Clock size={16} className={selectedSlot === slot.id ? "text-white" : "text-[#E15859]"} />
                    </div>
                    <span className="font-bold">{slot.time}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Button */}
            <div className="px-10 mt-auto mb-4">
              <button
                disabled={selectedSlot === null}
                onClick={() => setStep("payment")}
                className={`w-full py-[22px] rounded-[32px] text-[20px] font-bold shadow-lg transition-all ${
                  selectedSlot !== null ? "bg-[#E15859] text-white" : "bg-[#E15859]/30 text-white/50 cursor-not-allowed"
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Забронировать
              </button>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 relative flex flex-col"
          >
            {/* Blurred background image */}
            <div className="absolute inset-0 z-0">
               <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/eca39e85-e059-4463-8b02-d72196908069/55-resized-1768289316561.webp?width=8000&height=8000&resize=contain" 
                  alt="Dining" 
                  className="w-full h-1/2 object-cover opacity-30 blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E9E9E9]"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col pt-16 px-6">
              <div className="bg-white rounded-[32px] p-8 shadow-xl">
                {/* Summary */}
                <div className="space-y-6 mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-[#8E8E93] text-sm font-medium mb-1">Дата</p>
                    <p className="text-[#E15859] text-2xl font-black">07.11.25</p>
                  </div>
                  <div>
                    <p className="text-[#8E8E93] text-sm font-medium mb-1">Локация</p>
                    <p className="text-[#E15859] text-2xl font-black">{city || "Москва"}</p>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-8">
                  <p className="text-[#404243] font-medium mb-3">Промокод</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-white border border-[#D1D1D1] rounded-full px-6 py-4 text-sm focus:outline-none focus:border-[#E15859]"
                    />
                    <button className="w-20 bg-[#E15859] rounded-[24px] flex items-center justify-center shadow-md">
                      <Check className="text-white" size={24} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-8 border-t border-gray-100 pt-6">
                  <span className="text-[#404243] text-xl font-medium">Итого</span>
                  <span className="text-[#2A2021] text-2xl font-black">1 500 ₽</span>
                </div>

                {/* Info Text */}
                <p className="text-[10px] text-[#404243] leading-relaxed mb-4 opacity-70">
                  Возврат средств возможен только в случае, если вы отмените до полуночи понедельника, предшествующего дня ужина.
                </p>
                <p className="text-[10px] text-[#404243] leading-relaxed mb-6 opacity-70">
                  Нажимая на кнопку, вы даете согласие на <span className="underline">обработку персональных данных</span>, и соглашаетесь с <span className="underline">политикой конфиденциальности</span>
                </p>

                {/* Offer Checkbox */}
                <button 
                  onClick={() => setAcceptedOffer(!acceptedOffer)}
                  className="flex items-center gap-3 mb-8 group"
                >
                  <div className={`w-7 h-7 rounded-[8px] border-2 flex items-center justify-center transition-all ${acceptedOffer ? "bg-[#E15859] border-[#E15859]" : "border-[#D1D1D1]"}`}>
                    {acceptedOffer && <Check className="text-white" size={16} strokeWidth={4} />}
                  </div>
                  <span className="text-[#404243] font-medium underline">Я принимаю условия оферты</span>
                </button>

                {/* Pay Button */}
                <button
                  disabled={!acceptedOffer}
                  onClick={() => setStep("success")}
                  className={`w-full py-[22px] rounded-[32px] text-[20px] font-bold shadow-lg transition-all ${
                    acceptedOffer ? "bg-[#E15859] text-white" : "bg-[#E15859]/30 text-white/50 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
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
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
          >
            <div className="w-24 h-24 bg-[#E15859] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#E15859]/20">
              <Check className="text-white" size={48} strokeWidth={3} />
            </div>
            
            <h2 className="text-[#2A2021] text-[34px] font-black uppercase mb-4 leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Готово!
            </h2>
            
            <p className="text-[#404243] text-lg mb-12 leading-relaxed">
              Ваше бронирование успешно подтверждено. Мы ждем вас на ужине!
            </p>

            <div className="bg-white rounded-[32px] p-8 w-full shadow-sm mb-12 text-left space-y-4">
              <div className="flex items-center gap-4">
                <Calendar className="text-[#E15859]" size={20} />
                <div>
                  <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest">Дата</p>
                  <p className="text-[#404243] font-bold">7 января, 18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-[#E15859]" size={20} />
                <div>
                  <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest">Локация</p>
                  <p className="text-[#404243] font-bold">{city || "Москва"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full py-[22px] rounded-[32px] bg-[#E15859] text-white text-[20px] font-bold shadow-lg hover:bg-[#d14849] transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Продолжить
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab="home" />
    </div>
  );
}

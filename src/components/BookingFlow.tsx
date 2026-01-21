"use client";

import { useState, useEffect } from "react";
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
import { getSlots, createBooking, getUserBookings, type Slot } from "@/lib/api";

type BookingStep = "booking" | "payment" | "success";

interface BookingFlowProps {
  city: string;
  userId?: number;
  onBack: () => void;
  onComplete?: () => void;
  onTabChange?: (tab: "home" | "contacts" | "profile") => void;
}

export function BookingFlow({ city, userId, onBack, onComplete, onTabChange }: BookingFlowProps) {
  const [step, setStep] = useState<BookingStep>("booking");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [acceptedOffer, setAcceptedOffer] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const result = await getSlots(city);
        setSlots(result.slots); // Исправлено: берем slots из result
      } catch (error) {
        console.error('Error loading slots:', error);
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadSlots();
  }, [city]);

  const handleBookSlot = async () => {
    if (!selectedSlot || !userId) return;
    
    setIsBooking(true);
    setBookingError(null);
    
    try {
      // Check if user already has a booking for this slot
      const userBookings = await getUserBookings(userId);
      const alreadyBooked = userBookings.bookings.some(booking => booking.slot_id === selectedSlot);
      
      if (alreadyBooked) {
        setBookingError("Вы уже забронировали этот слот");
        setIsBooking(false);
        return;
      }
      
      const success = await createBooking(userId, selectedSlot);
      if (success) {
        setStep("payment");
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      // Extract meaningful error message
      let errorMessage = error?.message || error?.detail || "Не удалось забронировать слот";
      if (
        errorMessage.includes("Slot is full") ||
        errorMessage.includes("already booked") ||
        errorMessage.includes("уже забронировано")
      ) {
        errorMessage = "Извините! На это время мест уже не осталось.";
      }
      setBookingError(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

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
                    src="/images/dining.png" 
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
              {isLoading ? (
                <div className="text-center py-8">Загрузка слотов...</div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Нет доступных слотов</div>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-full transition-all ${
                      selectedSlot === slot.id 
                        ? "bg-[#E15859] text-white shadow-md scale-[1.02]" 
                        : "bg-white text-[#404243] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{slot.date}</span>
                        <span className="text-sm opacity-80">{slot.restaurant}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedSlot === slot.id ? "bg-white/20" : "border border-[#E15859]/20"}`}>
                        <Clock size={16} className={selectedSlot === slot.id ? "text-white" : "text-[#E15859]"} />
                      </div>
                      <span className="font-bold">{slot.time}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Action Button */}
            <div className="px-10 mt-auto mb-4">
              {bookingError && (
                <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                  {bookingError}
                </div>
              )}
              <button
                disabled={selectedSlot === null || isLoading || isBooking}
                onClick={handleBookSlot}
                className={`w-full py-[22px] rounded-[32px] text-[20px] font-bold shadow-lg transition-all ${
                  (selectedSlot !== null && !isLoading && !isBooking) ? "bg-[#E15859] text-white" : "bg-[#E15859]/30 text-white/50 cursor-not-allowed"
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {isLoading ? "Загрузка..." : isBooking ? "Бронирование..." : "Забронировать"}
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
                  src="/images/dining.png" 
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
              onClick={onComplete || onBack}
              className="w-full py-[22px] rounded-[32px] bg-[#E15859] text-white text-[20px] font-bold shadow-lg hover:bg-[#d14849] transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Продолжить
            </button>
          </motion.div>
        )}
        </AnimatePresence>
  
        <BottomNav activeTab="home" onTabChange={onTabChange} />
      </div>
    );
  }


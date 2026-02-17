"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Settings, 
  Calendar,
  ArrowLeft
} from "lucide-react";
import { getUserBookings, type Booking } from "@/lib/api";

interface MyBookingsScreenProps {
  city: string;
  userId?: number;
  onBack: () => void;
  onTabChange: (tab: "home" | "contacts" | "profile") => void;
}

export function MyBookingsScreen({ city, userId, onBack, onTabChange }: MyBookingsScreenProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      console.log("[MyBookingsScreen] userId:", userId);
      if (userId) {
        console.log("[MyBookingsScreen] Loading bookings for userId:", userId);
        const result = await getUserBookings(userId);
        console.log("[MyBookingsScreen] Got bookings:", result.bookings);
        setBookings(result.bookings); // Исправлено: берем bookings из result
      } else {
        console.log("[MyBookingsScreen] userId is undefined!");
      }
      setIsLoading(false);
    };
    loadBookings();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: "#FFF7EF" }}>
      {/* Top Controls */}
      <div className="px-6 flex justify-between items-center mb-6 mt-4">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="text-[#E15859]" size={24} />
        </button>
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

      {/* Title */}
      <div className="px-6 mb-8">
        <h2 
          className="text-[#E15859] text-[40px] font-black uppercase text-center tracking-tight leading-none italic" 
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Мои бронирования
        </h2>
      </div>

      {/* Bookings List */}
      <div className="px-6 space-y-4 flex-1">
        {isLoading ? (
          <div className="text-center py-8">Загрузка бронирований...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">У вас нет бронирований</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="w-full bg-white rounded-[24px] px-6 py-5 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E15859] rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={20} />
                </div>
                <div>
                  <span className="text-[#404243] text-lg font-bold block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {booking.restaurant}
                  </span>
                  <span className="text-[#404243]/70 text-sm">
                    {booking.date} в {booking.time}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#E15859] font-bold text-lg">
                  {booking.max_people - (booking.current_bookings || 0)} мест
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Settings, 
  Calendar,
  ArrowLeft
} from "lucide-react";
import { BottomNav } from "./BottomNav";

interface MyBookingsScreenProps {
  city: string;
  onBack: () => void;
  onTabChange: (tab: "home" | "contacts" | "profile") => void;
}

export function MyBookingsScreen({ city, onBack, onTabChange }: MyBookingsScreenProps) {
  const bookings = [
    { id: "dinner", name: "Ужин", count: 12 },
    { id: "meetings", name: "Знакомства", count: 5 },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: "#E9E9E9" }}>
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
        {bookings.map((item) => (
          <div
            key={item.id}
            className="w-full bg-white rounded-[24px] px-6 py-5 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#E15859] rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={20} />
              </div>
              <span className="text-[#404243] text-lg font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {item.name}
              </span>
            </div>
            <span className="text-[#8E8E93] text-xl font-bold">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      <BottomNav activeTab="profile" onTabChange={onTabChange} />
    </div>
  );
}

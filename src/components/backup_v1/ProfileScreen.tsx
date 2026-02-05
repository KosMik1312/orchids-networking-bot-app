"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Settings, 
  ChevronRight,
  Calendar,
  Info
} from "lucide-react";

interface ProfileScreenProps {
  userName: string;
  userPhoto: string | null;
  city: string;
  onEditProfile: () => void;
  onMyBookings: () => void;
  onTabChange: (tab: "home" | "contacts" | "profile") => void;
}

export function ProfileScreen({ 
  userName, 
  userPhoto, 
  city, 
  onEditProfile, 
  onMyBookings,
  onTabChange 
}: ProfileScreenProps) {
  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: "#E9E9E9" }}>
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

      {/* Profile Card */}
      <div className="px-6 mb-8 relative">
        <div className="bg-white rounded-[40px] pt-24 pb-10 px-6 shadow-sm flex flex-col items-center relative overflow-visible mt-20">
          {/* Overlapping Photo */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2">
            <div className="w-44 h-44 rounded-full border-[6px] border-[#E9E9E9] overflow-hidden shadow-lg bg-gray-200">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl">?</span>
                </div>
              )}
            </div>
          </div>

          <h2 
            className="text-[#E15859] text-[40px] font-black uppercase mb-8 text-center tracking-tight leading-none italic" 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {userName || "ПАВЕЛ"}
          </h2>

          <button
            onClick={onEditProfile}
            className="w-full py-5 rounded-full bg-[#E15859] text-white font-bold text-lg shadow-md hover:bg-[#d14849] transition-all"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Редактировать профиль
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 space-y-4 flex-1">
        <button
          onClick={onMyBookings}
          className="w-full bg-white rounded-full px-6 py-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E15859] rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <span className="text-[#404243] text-lg font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Мои бронирования
            </span>
          </div>
          <ChevronRight className="text-[#E15859]" size={24} />
        </button>

        <button
          className="w-full bg-white rounded-full px-6 py-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E15859] rounded-xl flex items-center justify-center">
              <Info className="text-white" size={20} />
            </div>
            <span className="text-[#404243] text-lg font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Справочный центр
            </span>
          </div>
          <ChevronRight className="text-[#E15859]" size={24} />
        </button>
      </div>
    </div>
  );
}

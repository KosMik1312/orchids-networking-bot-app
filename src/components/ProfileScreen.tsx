"use client";

import { MapPin, Settings, ChevronRight, User, Calendar, Heart, Info } from "lucide-react";
import { BottomNav } from "./BottomNav";

interface ProfileScreenProps {
  city?: string;
  userName?: string;
  userPhoto?: string | null;
  completedMeetings?: number;
  totalMeetings?: number;
  onHome?: () => void;
  onAfisha?: () => void;
  onMyProfile?: () => void;
  onBookings?: () => void;
  onFavorites?: () => void;
  onHelp?: () => void;
  onEditProfile?: () => void;
}

export function ProfileScreen({
  city = "Москва",
  userName = "Павел",
  userPhoto = null,
  completedMeetings = 3,
  totalMeetings = 8,
  onHome,
  onAfisha,
  onMyProfile,
  onBookings,
  onFavorites,
  onHelp,
  onEditProfile,
}: ProfileScreenProps) {
  const menuItems = [
    { icon: User, label: "Моя анкета", onClick: onEditProfile || onMyProfile },
    { icon: Calendar, label: "Актуальные бронирования", onClick: onBookings },
    { icon: Heart, label: "Избранное", onClick: onFavorites },
    { icon: Info, label: "Справочный центр", onClick: onHelp },
  ];

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-4">
        <button className="text-[#2A2021] font-medium text-[17px]">Cancel</button>
        <div className="flex flex-col items-center">
          <span className="font-serif text-xl leading-tight" style={{ fontFamily: "'Times New Roman', serif" }}>Allora</span>
          <span className="text-[10px] text-[#8E8E93] tracking-wide">bot</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </button>
      </div>

      <div className="flex-1 px-6 pb-32">
        {/* Location & Settings */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
            <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
              <MapPin className="text-white" size={22} fill="white" />
            </div>
            <span className="font-medium text-[#404243] text-[15px] pr-2">г. {city}</span>
          </div>
          <button
            onClick={onEditProfile}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <Settings className="text-[#E15859]" size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Avatar & Name Card */}
        <div className="relative mb-6">
          {/* Avatar - positioned to overlap the card */}
          <div className="flex justify-center relative z-10">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-md">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <User className="text-white" size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Name Card */}
          <div className="bg-white rounded-[24px] pt-16 pb-6 -mt-[60px] shadow-sm">
            <h2
              className="text-[#2A2021] text-[28px] font-black uppercase text-center tracking-tight"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {userName}
            </h2>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center justify-between px-5 py-5 rounded-[20px] bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                  <item.icon className="text-[#E15859]" size={20} strokeWidth={1.5} />
                </div>
                <span className="text-[#404243] text-[15px] font-medium">{item.label}</span>
              </div>
              <ChevronRight className="text-[#BDBDBD]" size={20} />
            </button>
          ))}
        </div>

        {/* Meetings counter */}
        <p className="text-center text-[#8E8E93] text-[14px] mt-6">
          Завершенных встреч: {completedMeetings} из {totalMeetings}
        </p>
      </div>

      <BottomNav
        activeTab="profile"
        onTabChange={(tab) => {
          if (tab === "home") onHome?.();
          if (tab === "afisha") onAfisha?.();
        }}
      />
    </div>
  );
}

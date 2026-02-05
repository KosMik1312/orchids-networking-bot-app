"use client";

import { Home, Calendar, User } from "lucide-react";

interface BottomNavProps {
  activeTab?: "home" | "afisha" | "profile";
}

export function BottomNav({ activeTab = "home" }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <button className="flex flex-col items-center gap-1 min-w-[60px]">
        <Home 
          className={activeTab === "home" ? "text-[#E15859]" : "text-[#BDBDBD]"} 
          size={24} 
          strokeWidth={1.5}
        />
        <span className={`text-[11px] font-medium ${activeTab === "home" ? "text-[#E15859]" : "text-[#BDBDBD]"}`}>
          Главная
        </span>
      </button>
      <button className="flex flex-col items-center gap-1 min-w-[60px]">
        <Calendar 
          className={activeTab === "afisha" ? "text-[#E15859]" : "text-[#BDBDBD]"} 
          size={24} 
          strokeWidth={1.5}
        />
        <span className={`text-[11px] font-medium ${activeTab === "afisha" ? "text-[#E15859]" : "text-[#BDBDBD]"}`}>
          Афиша
        </span>
      </button>
      <button className="flex flex-col items-center gap-1 min-w-[60px]">
        <User 
          className={activeTab === "profile" ? "text-[#E15859]" : "text-[#BDBDBD]"} 
          size={24} 
          strokeWidth={1.5}
        />
        <span className={`text-[11px] font-medium ${activeTab === "profile" ? "text-[#E15859]" : "text-[#BDBDBD]"}`}>
          Профиль
        </span>
      </button>
    </div>
  );
}

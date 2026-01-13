"use client";

import { Home, MessageSquare, User } from "lucide-react";

interface BottomNavProps {
  activeTab?: "home" | "contacts" | "profile";
}

export function BottomNav({ activeTab = "home" }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <button className="flex flex-col items-center gap-1">
        <Home className={activeTab === "home" ? "text-[#E15859]" : "text-[#BDBDBD]"} size={24} />
        <span className={`text-[10px] font-medium ${activeTab === "home" ? "text-[#E15859]" : "text-[#BDBDBD]"}`}>
          Главная
        </span>
      </button>
      <button className="flex flex-col items-center gap-1">
        <MessageSquare className={activeTab === "contacts" ? "text-[#E15859]" : "text-[#BDBDBD]"} size={24} />
        <span className={`text-[10px] font-medium ${activeTab === "contacts" ? "text-[#BDBDBD]" : "text-[#BDBDBD]"}`}>
          Контакты
        </span>
      </button>
      <button className="flex flex-col items-center gap-1">
        <User className={activeTab === "profile" ? "text-[#E15859]" : "text-[#BDBDBD]"} size={24} />
        <span className={`text-[10px] font-medium ${activeTab === "profile" ? "text-[#E15859]" : "text-[#BDBDBD]"}`}>
          Профиль
        </span>
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface SettingsScreenProps {
  onBack?: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const menuItems = [
    { label: "Политика конфиденциальности" },
    { label: "Договор оферты" },
    { label: "Обработка персональных данных" },
  ];

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-4">
        <button onClick={onBack} className="text-[#2A2021] font-medium text-[17px]">
          Cancel
        </button>
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

      <div className="flex-1 px-6 pb-8 flex flex-col">
        {/* Title */}
        <h1
          className="text-[#E15859] text-[32px] font-black uppercase text-center tracking-tight leading-none mt-6 mb-8"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Настройки
        </h1>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between px-6 py-5 rounded-[20px] bg-white shadow-sm"
            >
              <span className="text-[#404243] text-[15px] font-medium">{item.label}</span>
              <ChevronRight className="text-[#BDBDBD]" size={20} />
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onBack}
            className="w-14 h-14 bg-[#E15859] rounded-full flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="text-white" size={28} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 py-4 rounded-full border-2 border-[#E15859] text-[#E15859] text-[17px] font-semibold bg-white"
          >
            Удалить аккаунт
          </button>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Dimmed background */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowDeleteConfirm(false)}
          />

          {/* Overlay on top of the screen content */}
          <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: "rgba(233,233,233,0.6)" }}>
            {/* Header (faded) */}
            <div className="flex justify-between items-center px-6 pt-12 pb-4 opacity-30">
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

            {/* Title (faded) */}
            <h1
              className="text-[#E15859] text-[32px] font-black uppercase text-center tracking-tight leading-none mt-6 mb-8 opacity-30"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Настройки
            </h1>

            {/* Menu items (faded) */}
            <div className="px-6 space-y-3 opacity-30">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between px-6 py-5 rounded-[20px] bg-white shadow-sm"
                >
                  <span className="text-[#404243] text-[15px] font-medium">{item.label}</span>
                  <ChevronRight className="text-[#BDBDBD]" size={20} />
                </div>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Confirmation card */}
            <div className="px-6 pb-8">
              <div className="bg-white rounded-[24px] px-6 py-8 shadow-lg">
                <h2
                  className="text-[#2A2021] text-[22px] font-black uppercase text-center tracking-tight leading-tight mb-3"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Ты уверен, что хочешь удалить аккаунт?
                </h2>
                <p className="text-[#8E8E93] text-[14px] text-center leading-relaxed mb-6">
                  Восстановить ваш аккаунт или любую удалённую информацию будет невозможно
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold"
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

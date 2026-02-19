"use client";

import { useState } from "react";
import { ChevronLeft, Send, Instagram } from "lucide-react";

interface SocialLinksScreenProps {
  onNext: (socials: { telegram: string; instagram: string }) => void;
  onBack: () => void;
  progress: number;
}

export function SocialLinksScreen({ onNext, onBack, progress }: SocialLinksScreenProps) {
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");

  const handleContinue = () => onNext({ telegram: telegram.trim(), instagram: instagram.trim() });
  const isFilled = telegram.trim() !== "" || instagram.trim() !== "";

  return (
    <div className="flex h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      <div className="px-6 pt-6">
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-[#E15859]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-6 text-center">
          <h2 className="text-[#2A2021] text-2xl font-bold">Социальные сети</h2>
          <p className="text-[#8E8E93] mt-2">Поделитесь контактами (необязательно)</p>
        </div>

        <div className="w-full max-w-md space-y-3">
          <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="Telegram" className="w-full px-4 py-3 rounded-[12px] border border-[#E0E0E0]" />
          <div className="relative">
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className="w-full px-4 py-3 rounded-[12px] border border-[#E0E0E0]" />
            <div className="absolute right-3 top-3 text-[#BDBDBD]"><Instagram size={18} /></div>
          </div>
          <button onClick={handleContinue} disabled={!isFilled} className={`w-full py-3 rounded-[12px] ${isFilled ? 'bg-[#E15859] text-white' : 'bg-[#E15859]/40 text-white/60 cursor-not-allowed'}`}>
            Отправить
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="text-sm text-[#8E8E93]">Прогресс: {progress}%</div>
      </div>
    </div>
  );
}

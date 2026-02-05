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

  const handleContinue = () => {
    onNext({ telegram, instagram });
  };

  const isFilled = telegram.trim() !== "" || instagram.trim() !== "";

  return (
    <div className="flex h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#E9E9E9", touchAction: "pan-y" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-16 pb-12 shrink-0">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: "#C8CACB" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ backgroundColor: "#404243", width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="px-10 mb-12 shrink-0 text-center">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          ТВОИ СОЦИАЛЬНЫЕ СЕТИ
        </h2>
      </div>

      {/* Inputs */}
      <div className="flex-1 px-6 mb-4 overflow-y-auto">
        <div className="flex flex-col gap-5 w-full max-w-[340px] mx-auto">
          {/* Telegram Input */}
          <div className="relative">
            <div
              className="flex h-[80px] items-center rounded-full bg-white px-4 shadow-sm"
              style={{ border: "1px solid #FFFFFF" }}
            >
              <div
                className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#E15859" }}
              >
                <Send size={24} color="white" className="translate-x-0.5 -translate-y-0.5" />
              </div>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Введите никнейм"
                className="ml-4 flex-1 bg-transparent text-[20px] outline-none placeholder:text-[#707579]/60"
                style={{ fontFamily: "'Montserrat', sans-serif", color: "#404243" }}
              />
            </div>
          </div>

          {/* Instagram Input */}
          <div className="relative">
            <div
              className="flex h-[80px] items-center rounded-full bg-white px-4 shadow-sm"
              style={{ border: "1px solid #FFFFFF" }}
            >
              <div
                className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#E15859" }}
              >
                <Instagram size={24} color="white" />
              </div>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Введите никнейм"
                className="ml-4 flex-1 bg-transparent text-[20px] outline-none placeholder:text-[#707579]/60"
                style={{ fontFamily: "'Montserrat', sans-serif", color: "#404243" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between px-10 pb-12 gap-4 shrink-0">
        <button
          onClick={onBack}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-[1.5px] transition-colors active:scale-95 shrink-0"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={28} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          className="h-[64px] flex-1 rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: !isFilled ? "rgba(225, 88, 89, 0.3)" : "#E15859",
            color: "white",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}

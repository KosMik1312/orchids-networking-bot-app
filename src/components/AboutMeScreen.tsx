"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface AboutMeScreenProps {
  onNext: (about: string) => void;
  onBack: () => void;
  progress: number;
}

export function AboutMeScreen({ onNext, onBack, progress }: AboutMeScreenProps) {
  const [text, setText] = useState("");
  const maxLength = 500;

  const handleContinue = () => {
    if (text.trim().length > 0) {
      onNext(text);
    }
  };

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
      <div className="px-10 mb-2 shrink-0 text-center">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          РАССКАЖИ О СЕБЕ
        </h2>
        <div className="flex justify-end mt-4">
          <p 
            className="text-[16px] font-medium" 
            style={{ fontFamily: "'Montserrat', sans-serif", color: "#404243" }}
          >
            {text.length}/{maxLength}
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-1 px-8 flex flex-col mb-4">
        <div 
          className="w-full flex-1 rounded-[40px] bg-white p-8 shadow-sm"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            placeholder="Напиши 5-7 фактов о себе, которыми бы ты поделился с новым человеком..."
            className="w-full h-full resize-none border-none outline-none text-[18px] leading-relaxed text-[#404243] bg-transparent placeholder:text-[#C8CACB]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          />
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
            backgroundColor: text.trim().length === 0 ? "rgba(225, 88, 89, 0.3)" : "#E15859",
            color: "white",
            fontFamily: "'Montserrat', sans-serif",
          }}
          disabled={text.trim().length === 0}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}

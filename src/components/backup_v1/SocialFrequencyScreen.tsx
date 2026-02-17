"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface SocialFrequencyScreenProps {
  onNext: (level: number) => void;
  onBack: () => void;
  progress: number;
}

export function SocialFrequencyScreen({ onNext, onBack, progress }: SocialFrequencyScreenProps) {
  const [frequency, setFrequency] = useState<number | null>(null);

  const frequencies = [
    { value: 1, label: "Ни разу" },
    { value: 2, label: "Раз-два в год" },
    { value: 3, label: "Раз в месяц" },
    { value: 4, label: "2-3 раза в месяц" },
    { value: 5, label: "Раз в неделю" },
    { value: 6, label: "Несколько раз в неделю" }
  ];

  const handleContinue = () => {
    if (frequency !== null) {
      onNext(frequency);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
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
      <div className="px-10 mb-12 shrink-0">
        <h2
          className="text-[32px] font-black leading-[1.1] uppercase tracking-tighter text-center"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          КАК ЧАСТО ТЫ ЗНАКОМИШЬСЯ С НОВЫМИ ЛЮДЬМИ?
        </h2>
      </div>

      {/* Scale Selection */}
      <div className="flex-1 px-6 flex flex-col items-center justify-start pt-4">
        <div className="flex justify-between w-full max-w-[340px] mb-8">
          {frequencies.map((freq) => {
            const isSelected = frequency !== null && freq.value <= frequency;
            return (
              <button
                key={freq.value}
                onClick={() => setFrequency(freq.value)}
                className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-[20px] font-bold transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: isSelected ? "#E15859" : "white",
                  color: isSelected ? "white" : "#E15859",
                }}
              >
                {freq.value}
              </button>
            );
          })}
        </div>

        {/* Labels */}
        <div className="flex justify-between w-full max-w-[340px] gap-4 px-1">
          <div 
            className="text-[14px] leading-tight text-left w-[140px]"
            style={{ fontFamily: "'Montserrat', sans-serif", color: "#404243" }}
          >
            Редко, сам почти не начинаю знакомство
          </div>
          <div 
            className="text-[14px] leading-tight text-right w-[150px]"
            style={{ fontFamily: "'Montserrat', sans-serif", color: "#404243" }}
          >
            При любой возможности знакомлюсь с кем-то новым
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between px-10 pb-12 gap-4 shrink-0 mt-auto">
        <button
          onClick={onBack}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-[1.5px] transition-colors active:scale-95 shrink-0"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={28} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={frequency === null}
          className="h-[64px] flex-1 rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: frequency === null ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

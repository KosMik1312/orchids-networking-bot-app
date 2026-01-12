"use client";

import { useState } from "react";
import { ChevronLeft, MessageCircle, PartyPopper } from "lucide-react";

export type CommunicationFormat = "light" | "active";

interface CommunicationFormatScreenProps {
  onNext: (format: CommunicationFormat) => void;
  onBack: () => void;
  progress: number;
}

const LightIcon = () => (
  <MessageCircle size={28} strokeWidth={2.5} />
);

const ActiveIcon = () => (
  <PartyPopper size={28} strokeWidth={2.5} />
);

export function CommunicationFormatScreen({ onNext, onBack, progress }: CommunicationFormatScreenProps) {
  const [selectedFormat, setSelectedFormat] = useState<CommunicationFormat | null>(null);

  const options = [
    { 
      id: "light" as CommunicationFormat, 
      label: "Лёгкое, непринужденное общение без серьёзных тем", 
      icon: LightIcon 
    },
    { 
      id: "active" as CommunicationFormat, 
      label: "Активный формат (боулинг, путешествия, квесты и пр.)", 
      icon: ActiveIcon 
    },
  ];

  const handleContinue = () => {
    if (selectedFormat) {
      onNext(selectedFormat);
    }
  };

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
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
          className="text-[32px] font-black leading-tight uppercase tracking-tight text-center"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          КАКОЙ ФОРМАТ ОБЩЕНИЯ ТЕБЕ БЛИЖЕ?
        </h2>
      </div>

      {/* Options */}
      <div className="flex-1 px-6 mb-4 overflow-y-auto">
        <div className="flex flex-col gap-5 w-full max-w-[340px] mx-auto">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedFormat === option.id;
            const isDimmed = selectedFormat !== null && !isSelected;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
                className="flex items-center gap-4 w-full min-h-[100px] py-4 px-6 rounded-[32px] transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: isSelected ? "#E15859" : "white",
                  opacity: isDimmed ? 0.6 : 1,
                }}
              >
                <div
                  className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: isSelected ? "white" : "#E15859",
                    color: isSelected ? "#E15859" : "white",
                  }}
                >
                  <Icon />
                </div>
                <span
                  className="text-[16px] font-semibold text-left transition-colors duration-300 leading-tight"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: isSelected ? "white" : "#404243",
                  }}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
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
          disabled={!selectedFormat}
          className="h-[64px] flex-1 rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: !selectedFormat ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

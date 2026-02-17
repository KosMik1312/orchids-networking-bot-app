"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export type ChildrenStatus = "yes" | "no" | "prefer_not_to_say";

interface ChildrenSelectionScreenProps {
  onNext: (status: ChildrenStatus) => void;
  onBack: () => void;
  progress: number;
}

const BabyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 4C11.5817 4 8 7.58172 8 12C8 14.2091 8.89543 16.2091 10.3431 17.6569C10.75 18.0637 11.25 18.5 11.25 19.5V22C11.25 24.6228 13.3772 26.75 16 26.75C18.6228 26.75 20.75 24.6228 20.75 22V19.5C20.75 18.5 21.25 18.0637 21.6569 17.6569C23.1046 16.2091 24 14.2091 24 12C24 7.58172 20.4183 4 16 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12C12 12 13 13 16 13C19 13 20 12 20 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="13" cy="10" r="1" fill="currentColor" />
    <circle cx="19" cy="10" r="1" fill="currentColor" />
  </svg>
);

const SmileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    <circle cx="20" cy="13" r="1.5" fill="currentColor" />
    <path
      d="M11 19C11 19 12.5 22 16 22C19.5 22 21 19 21 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const XIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 9L23 23M23 9L9 23" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export function ChildrenSelectionScreen({ onNext, onBack, progress }: ChildrenSelectionScreenProps) {
  const [selected, setSelected] = useState<ChildrenStatus | null>(null);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-16 pb-12">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: "#C8CACB" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ backgroundColor: "#404243", width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 flex flex-col items-center px-6">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight mb-12 text-center"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          ЕСТЬ ЛИ У ТЕБЯ ДЕТИ?
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-4 w-full max-w-[340px]">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedStatus === option.id;
            const isDimmed = selectedStatus !== null && !isSelected;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedStatus(option.id)}
                className="flex items-center gap-4 w-full h-[84px] px-6 rounded-full transition-all duration-300"
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
                  className="text-[18px] font-semibold text-left transition-colors duration-300"
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
      <div className="flex items-center justify-between px-10 pb-12 gap-4">
        <button
          onClick={onBack}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[1.5px] transition-colors active:scale-95"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={32} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedStatus}
          className="h-[72px] flex-1 rounded-full text-[20px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: !selectedStatus ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

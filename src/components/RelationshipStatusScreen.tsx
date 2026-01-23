"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export type RelationshipStatus = "in_relationship" | "single" | "prefer_not_to_say";

interface RelationshipStatusScreenProps {
  onNext: (status: RelationshipStatus) => void;
  onBack: () => void;
  progress: number;
}

const RingIcon = ({ isSelected }: { isSelected: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="19" r="6.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="20" cy="13" r="6.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const HeartCrackIcon = ({ isSelected }: { isSelected: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 28L14.5 26.5C9.5 22 4 17 4 11C4 6.5 7.5 3 12.5 3C15 3 17.1 4.2 18.2 6C19.3 4.2 21.4 3 23.9 3C28.9 3 32.4 6.5 32.4 11C32.4 17 26.9 22 21.9 26.5L20.4 28H16Z"
      fill="currentColor"
    />
    <path
      d="M16 6L18.5 9.5L15 13L18.5 16.5L15 20L18.5 23.5L16 26"
      stroke={isSelected ? "#E15859" : "white"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = ({ isSelected }: { isSelected: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 9L23 23M23 9L9 23" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export function RelationshipStatusScreen({ onNext, onBack, progress }: RelationshipStatusScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<RelationshipStatus | null>(null);

  const options = [
    {
      id: "in_relationship" as RelationshipStatus,
      label: "В отношениях / в браке",
      icon: RingIcon,
    },
    {
      id: "single" as RelationshipStatus,
      label: "Без партнера",
      icon: HeartCrackIcon,
    },
    {
      id: "prefer_not_to_say" as RelationshipStatus,
      label: "Предпочитаю не указывать",
      icon: XIcon,
    },
  ];

  const handleContinue = () => {
    if (selectedStatus) {
      onNext(selectedStatus);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#E9E9E9", touchAction: "pan-y" }}>
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
          СЕМЕЙНЫЙ СТАТУС
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
                  <Icon isSelected={isSelected} />
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

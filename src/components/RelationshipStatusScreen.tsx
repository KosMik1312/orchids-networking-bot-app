"use client";

import { useState } from "react";
import { ChevronLeft, Ring, HeartCrack, X } from "lucide-react";

export type RelationshipStatus = "in_relationship" | "single" | "prefer_not_to_say";

interface RelationshipStatusScreenProps {
  onNext: (status: RelationshipStatus) => void;
  onBack: () => void;
  progress: number;
}

export function RelationshipStatusScreen({ onNext, onBack, progress }: RelationshipStatusScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<RelationshipStatus | null>(null);

  const options = [
    {
      id: "in_relationship" as RelationshipStatus,
      label: "В отношениях / в браке",
      icon: Ring,
    },
    {
      id: "single" as RelationshipStatus,
      label: "Без партнера",
      icon: HeartCrack,
    },
    {
      id: "prefer_not_to_say" as RelationshipStatus,
      label: "Предпочитаю не указывать",
      icon: X,
    },
  ];

  const handleContinue = () => {
    if (selectedStatus) {
      onNext(selectedStatus);
    }
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
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

            return (
              <button
                key={option.id}
                onClick={() => setSelectedStatus(option.id)}
                className="flex items-center gap-4 w-full h-[84px] px-6 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isSelected ? "#E15859" : "white",
                  color: isSelected ? "white" : "#404243",
                }}
              >
                <div
                  className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isSelected ? "white" : "#E15859",
                    color: isSelected ? "#E15859" : "white",
                  }}
                >
                  <Icon size={32} strokeWidth={2} />
                </div>
                <span
                  className="text-[18px] font-medium text-left"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
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
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[1.5px] transition-colors"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={32} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedStatus}
          className="h-[72px] flex-1 rounded-full text-[20px] font-medium transition-all"
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

"use client";

import { useState } from "react";
import { ChevronLeft, CircleDot, MessageSquare, Zap, Users, Dice5, Heart } from "lucide-react";

export type InterestType = 
  | "sport" 
  | "culture" 
  | "extreme" 
  | "gatherings" 
  | "board_games" 
  | "excitement";

interface InterestsSelectionScreenProps {
  onNext: (interest: InterestType) => void;
  onBack: () => void;
  progress: number;
}

const SportIcon = () => <CircleDot size={28} strokeWidth={2.5} />;
const CultureIcon = () => <MessageSquare size={28} strokeWidth={2.5} />;
const ExtremeIcon = () => <Zap size={28} strokeWidth={2.5} />;
const GatheringsIcon = () => <Users size={28} strokeWidth={2.5} />;
const BoardGamesIcon = () => <Dice5 size={28} strokeWidth={2.5} />;
const ExcitementIcon = () => <Heart size={28} strokeWidth={2.5} />;

export function InterestsSelectionScreen({ onNext, onBack, progress }: InterestsSelectionScreenProps) {
  const [selectedInterest, setSelectedInterest] = useState<InterestType | null>(null);

  const options = [
    { id: "sport" as InterestType, label: "Спорт", icon: SportIcon },
    { id: "culture" as InterestType, label: "Культурный отдых", icon: CultureIcon },
    { id: "extreme" as InterestType, label: "Экстрим", icon: ExtremeIcon },
    { id: "gatherings" as InterestType, label: "Душевные посиделки", icon: GatheringsIcon },
    { id: "board_games" as InterestType, label: "Настольные игры", icon: BoardGamesIcon },
    { id: "excitement" as InterestType, label: "Азарт", icon: ExcitementIcon },
  ];

  const handleContinue = () => {
    if (selectedInterest) {
      onNext(selectedInterest);
    }
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
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
      <div className="px-10 mb-8 shrink-0">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight text-center"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          ТВОИ ИНТЕРЕСЫ
        </h2>
      </div>

      {/* Options - Scrollable */}
      <div className="flex-1 px-6 mb-4 overflow-y-auto pb-4">
        <div className="flex flex-col gap-4 w-full max-w-[340px] mx-auto">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedInterest === option.id;
            const isDimmed = selectedInterest !== null && !isSelected;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedInterest(option.id)}
                className="flex items-center gap-4 w-full h-[72px] px-6 rounded-full transition-all duration-300 shrink-0"
                style={{
                  backgroundColor: isSelected ? "#E15859" : "white",
                  opacity: isDimmed ? 0.6 : 1,
                }}
              >
                <div
                  className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full transition-colors duration-300"
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
          disabled={!selectedInterest}
          className="h-[64px] flex-1 rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: !selectedInterest ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

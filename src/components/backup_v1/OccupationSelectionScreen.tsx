"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export type OccupationType = 
  | "unemployed" 
  | "it" 
  | "retail" 
  | "education" 
  | "government" 
  | "transport" 
  | "finance" 
  | "services" 
  | "production" 
  | "hospitality" 
  | "marketing" 
  | "other";

interface OccupationSelectionScreenProps {
  onNext: (occupation: OccupationType) => void;
  onBack: () => void;
  progress: number;
}

const XIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 9L23 23M23 9L9 23" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const ITIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M16 6C16 6 19 9 19 16C19 23 16 26 16 26M16 6C16 6 13 9 13 16C13 23 16 26 16 26" stroke="currentColor" strokeWidth="2" />
    <path d="M6 16H26" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const RetailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12V24H23V12M12 12V10C12 7.79086 13.7909 6 16 6V6C18.2091 6 20 7.79086 20 10V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const EducationIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L16 7L26 12L16 17L6 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 14V19C10 19 12 21 16 21C20 21 22 19 22 19V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GovernmentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 25V7L21 11L9 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TransportIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 16H25M7 16V12C7 10 9 8 11 8H21C23 8 25 10 25 12V16M7 16V20H25V16" stroke="currentColor" strokeWidth="2" />
    <circle cx="10" cy="22" r="2" fill="currentColor" />
    <circle cx="22" cy="22" r="2" fill="currentColor" />
  </svg>
);

const FinanceIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8V24M8 16H24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const ServicesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8C16 8 18 11 21 11C24 11 26 13 26 16C26 19 24 21 21 21C18 21 16 24 16 24C16 24 14 21 11 21C8 21 6 19 6 16C6 13 8 11 11 11C14 11 16 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const ProductionIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 22L22 10M22 10L24 12M22 10L20 8M10 22L8 20M10 22L12 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="21" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="11" cy="21" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const HospitalityIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 7V16M8 7V11C8 12.6569 9.34315 14 11 14C12.6569 14 14 12.6569 14 11V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 7V25M19 7C19 7 19 14 22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M11 16V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MarketingIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8L24 16L10 24V8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const OtherIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="16" r="2" fill="currentColor" />
    <circle cx="16" cy="16" r="2" fill="currentColor" />
    <circle cx="22" cy="16" r="2" fill="currentColor" />
  </svg>
);

export function OccupationSelectionScreen({ onNext, onBack, progress }: OccupationSelectionScreenProps) {
  const [selected, setSelected] = useState<OccupationType | null>(null);
  const [customValue, setCustomValue] = useState("");

  const occupations: OccupationType[] = [
    "IT / Технологии", "Финансы / Банки", "Маркетинг / Реклама",
    "Медицина", "Образование", "Юриспруденция", "Искусство / Культура",
    "Предпринимательство", "Госслужба", "Другое"
  ];

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-16 pb-8 shrink-0">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: "#C8CACB" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ backgroundColor: "#404243", width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="px-6 mb-6 shrink-0">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight text-center"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          СФЕРА ДЕЯТЕЛЬНОСТИ
        </h2>
      </div>

      {/* Scrollable Options */}
      <div className="flex-1 overflow-y-auto px-6 mb-4 custom-scrollbar">
        <div className="flex flex-col gap-3 w-full max-w-[340px] mx-auto pb-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOccupation === option.id;
            const isDimmed = selectedOccupation !== null && !isSelected;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedOccupation(option.id)}
                className="flex items-center gap-4 w-full h-[72px] px-6 rounded-full transition-all duration-300"
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
      <div className="flex items-center justify-between px-10 pb-12 gap-4 shrink-0 bg-[#E9E9E9] pt-2">
        <button
          onClick={onBack}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-[1.5px] transition-colors active:scale-95 shrink-0"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={28} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedOccupation}
          className="h-[64px] flex-1 rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: !selectedOccupation ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

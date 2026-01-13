"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface GenderSelectionScreenProps {
  onNext: (gender: "male" | "female") => void;
  onBack: () => void;
  progress: number;
}

export function GenderSelectionScreen({ onNext, onBack, progress }: GenderSelectionScreenProps) {
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(null);

  const handleContinue = () => {
    if (selectedGender) {
      onNext(selectedGender);
    }
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-12 pb-8">
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
          className="text-[28px] font-black leading-tight uppercase tracking-tight mb-8"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          ТВОЙ ПОЛ
        </h2>

        {/* Gender Options */}
        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          {/* Male Option */}
          <button
            onClick={() => setSelectedGender("male")}
            className="flex flex-col items-center justify-center py-6 rounded-[24px] transition-all duration-300"
            style={{
              backgroundColor: selectedGender === "male" ? "#4F7BFF" : "#E8EFFF",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2"
            >
              <path
                d="M48 52C55.732 52 62 45.732 62 38C62 30.268 55.732 24 48 24C40.268 24 34 30.268 34 38C34 45.732 40.268 52 48 52Z"
                stroke={selectedGender === "male" ? "white" : "#4F7BFF"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M76 24L58 42"
                stroke={selectedGender === "male" ? "white" : "#4F7BFF"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M62 24H76V38"
                stroke={selectedGender === "male" ? "white" : "#4F7BFF"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-[20px] font-semibold"
              style={{
                color: selectedGender === "male" ? "white" : "#4F7BFF",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Мужской
            </span>
          </button>

          {/* Female Option */}
          <button
            onClick={() => setSelectedGender("female")}
            className="flex flex-col items-center justify-center py-6 rounded-[24px] transition-all duration-300"
            style={{
              backgroundColor: selectedGender === "female" ? "#FF4F4F" : "#FFE8E8",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2"
            >
              <path
                d="M50 62C58.8366 62 66 54.8366 66 46C66 37.1634 58.8366 30 50 30C41.1634 30 34 37.1634 34 46C34 54.8366 41.1634 62 50 62Z"
                stroke={selectedGender === "female" ? "white" : "#FF4F4F"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M50 62V78"
                stroke={selectedGender === "female" ? "white" : "#FF4F4F"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M42 70H58"
                stroke={selectedGender === "female" ? "white" : "#FF4F4F"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-[20px] font-semibold"
              style={{
                color: selectedGender === "female" ? "white" : "#FF4F4F",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Женский
            </span>
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between px-10 pb-12 pt-8 gap-4">
        <button
          onClick={onBack}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[1.5px] transition-colors"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={32} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={!selectedGender}
          className="h-[72px] flex-1 rounded-full text-[20px] font-medium transition-all"
          style={{
            backgroundColor: !selectedGender ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

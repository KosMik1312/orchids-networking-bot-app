"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ChevronLeft } from "lucide-react";

interface QuizScreenProps {
  onNext: (name: string) => void;
  onBack: () => void;
}

export function QuizScreen({ onNext, onBack }: QuizScreenProps) {
  const [name, setName] = useState("");

  const handleContinue = () => {
    if (name.trim()) {
      onNext(name);
    }
  };

  const isNameEmpty = !name.trim();

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-16 pb-12">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: "#C8CACB" }}>
          <div
            className="h-full w-[10%] rounded-full transition-all duration-300"
            style={{ backgroundColor: "#404243" }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 px-6">
        <div className="mb-10 text-center">
          <h2
            className="text-[32px] font-black leading-tight uppercase tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
          >
            ДАВАЙТЕ НАЧНЕМ
            <br />
            С ТВОЕГО ИМЕНИ
          </h2>
        </div>

        {/* Input Field */}
        <div className="relative mx-auto max-w-sm">
          <div
            className="flex h-[64px] items-center rounded-full bg-white px-5 shadow-sm"
            style={{ border: "1px solid #FFFFFF" }}
          >
            <div
              className="mr-4 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "#D9D9D9" }}
            >
              <User size={24} style={{ color: "#707579" }} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя"
              className="flex-1 bg-transparent text-[20px] outline-none placeholder:text-[#707579]"
              style={{ fontFamily: "'Montserrat', sans-serif", color: "#2A2021" }}
            />
          </div>
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
          disabled={isNameEmpty}
          className="h-[72px] flex-1 rounded-full text-[20px] font-medium transition-all"
          style={{
            backgroundColor: isNameEmpty ? "rgba(225, 88, 89, 0.3)" : "#E15859",
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

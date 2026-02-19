"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ChevronLeft } from "lucide-react";

interface QuizScreenProps {
  onNext: (name: string) => void;
  onBack: () => void;
  progress: number;
}

export function QuizScreen({ onNext, onBack, progress }: QuizScreenProps) {
  const [name, setName] = useState("");
  const isNameEmpty = !name.trim();

  const handleContinue = () => { if (!isNameEmpty) onNext(name.trim()); };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      <div className="px-6 pt-6">
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-[#E15859]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-6 text-center">
          <h2 className="text-[#2A2021] text-2xl font-bold">Расскажите о себе</h2>
          <p className="text-[#8E8E93] mt-2">Как вас зовут?</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите имя" className="w-full px-4 py-3 rounded-[12px] border border-[#E0E0E0]" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleContinue} disabled={isNameEmpty} className={`flex-1 py-3 rounded-[12px] ${isNameEmpty ? 'bg-[#E15859]/40 text-white/60 cursor-not-allowed' : 'bg-[#E15859] text-white'}`}>
              Далее
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="text-sm text-[#8E8E93]">Прогресс: {progress}%</div>
      </div>
    </div>
  );
}

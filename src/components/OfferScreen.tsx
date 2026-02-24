"use client";

import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ru } from "@/lib/i18n";

interface OfferScreenProps {
  onBack: () => void;
}

export function OfferScreen({ onBack }: OfferScreenProps) {
  const texts = ru.offer;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      {/* Header */}
      <div className="sticky top-0 bg-[#FFF7EF] z-10 px-6 pt-8 pb-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="text-[#E15859]" size={24} />
        </button>
        <h1
          className="text-[#E15859] text-[20px] font-black uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.title}
        </h1>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 px-6 pb-8 overflow-y-auto"
      >
        <div
          className="text-[#2A2021] text-[7px] leading-relaxed space-y-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.sections.map((section, index) => (
            <div key={index}>
              {section.title && <p className="font-bold">{section.title}</p>}
              {section.content && section.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ru } from "@/lib/i18n";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [accepted, setAccepted] = useState(false);
  const texts = ru.welcome;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden relative" style={{ backgroundColor: '#E9E9E9', touchAction: 'pan-y' }}>

      {/* Top Logo Area */}
      <div className="pt-24 flex justify-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[#E15859] text-[45px] leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
        >
          {texts.logo}
          <div className="h-[2px] bg-[#E15859] w-full mt-1 opacity-70" />
        </motion.h2>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center text-center"
        >
          <h1
            className="text-[40px] leading-[0.9] font-black uppercase tracking-tight flex flex-col items-center"
            style={{ fontFamily: "'Oswald', sans-serif" }} // Using Oswald if available, or fallback to sans-serif
          >
            <span className="text-[#E15859] block mb-1">{texts.titlePart1}</span>
            <span className="text-[#2A2021] block">{texts.titlePart2}</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-[#555555] text-[16px] leading-snug max-w-[280px] mt-8 font-light"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.subtitle}
        </motion.p>
      </div>

      {/* Bottom Area */}
      <div className="px-10 pb-12">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileTap={accepted ? { scale: 0.98 } : {}}
          onClick={() => accepted && onStart()}
          disabled={!accepted}
          className={cn(
            "w-full py-[20px] rounded-[24px] text-white text-[18px] font-semibold transition-all duration-300 shadow-lg shadow-[#E15859]/20",
            accepted ? "bg-[#E15859] opacity-100" : "bg-[#E15859]/50 cursor-not-allowed"
          )}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.button}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-start gap-3 mt-6 justify-center"
        >
          <Checkbox
            id="consent"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            className="mt-0.5 border-[#E15859] data-[state=checked]:bg-[#E15859] data-[state=checked]:text-white rounded-[6px] size-[22px] shrink-0 transition-colors"
          />
          <label
            htmlFor="consent"
            className="text-[11px] text-[#2A2021] leading-tight cursor-pointer select-none max-w-[260px]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {texts.disclaimer}{" "}
            <span className="underline decoration-1 underline-offset-2">{texts.consentLink}</span>{" "}
            {texts.and}{" "}
            <span className="underline decoration-1 underline-offset-2">{texts.privacyLink}</span>
          </label>
        </motion.div>
      </div>
    </div >
  );
}

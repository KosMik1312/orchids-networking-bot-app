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
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: '#E9E9E9', touchAction: 'pan-y' }}>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col items-center"
        >
          <h1
            className="font-serif text-[44px] italic text-[#E15859] text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {texts.title}
          </h1>
          <div className="h-[1px] bg-[#E15859] w-[85%] mt-[-4px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2
            className="text-[34px] font-black tracking-tight leading-[1.1] uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="text-[#E15859]">{texts.headline1}</span>
            <br />
            <span className="text-[#2A2021]">{texts.headline2}</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-[#404243] text-[18px] max-w-[300px] leading-snug"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.subtitle}
        </motion.p>
      </div>

      <div className="px-10 pb-10">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileTap={accepted ? { scale: 0.98 } : {}}
          onClick={() => accepted && onStart()}
          disabled={!accepted}
          className={cn(
            "w-full py-[22px] rounded-full text-white text-[20px] font-medium transition-all duration-300",
            accepted ? "bg-[#E15859] opacity-100" : "bg-[#E15859]/40 cursor-not-allowed"
          )}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.button}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-start gap-3 mt-6"
        >
          <Checkbox
            id="consent"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            className="mt-0.5 border-[#E15859] data-[state=checked]:bg-[#E15859] data-[state=checked]:text-white rounded-[4px] size-[20px] shrink-0 transition-colors"
          />
          <label 
            htmlFor="consent" 
            className="text-[11px] text-[#2A2021] leading-tight cursor-pointer select-none"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {texts.disclaimer}{" "}
            <span className="underline decoration-1 underline-offset-2">{texts.consentLink}</span>{" "}
            {texts.and}{" "}
            <span className="underline decoration-1 underline-offset-2">{texts.privacyLink}</span>
          </label>
        </motion.div>
      </div>
    </div>
  );
}

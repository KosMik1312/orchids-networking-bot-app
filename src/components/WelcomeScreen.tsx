"use client";

import { motion } from "framer-motion";
import { ru } from "@/lib/i18n";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
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
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-[22px] rounded-full bg-[#E15859] text-white text-[20px] font-medium"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.button}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-[11px] text-[#2A2021] mt-6 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.disclaimer}{" "}
          <span className="underline">{texts.consentLink}</span>{" "}
          {texts.and}{" "}
          <span className="underline">{texts.privacyLink}</span>
        </motion.p>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#E9E9E9' }}>
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
            Аллора Клаб
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
            <span className="text-[#E15859]">СОЗДАЕМ ЯРКУЮ</span>
            <br />
            <span className="text-[#2A2021]">ЖИЗНЬ ВМЕСТЕ</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-[#404243] text-[18px] max-w-[300px] leading-snug"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Свежие впечатления, эмоции, приключения в компании новых людей
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
          Начать
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-[11px] text-[#2A2021] mt-6 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Нажимая на кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности
        </motion.p>
      </div>
    </div>
  );
}

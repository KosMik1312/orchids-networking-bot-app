"use client";

import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1
            className="font-serif text-5xl md:text-6xl italic text-[#E86A5C] text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Аллора Клаб
          </h1>
          <div className="h-[1px] bg-[#E86A5C] mt-1 mx-auto w-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2
            className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="text-[#E86A5C]">СОЗДАЕМ ЯРКУЮ</span>
            <br />
            <span className="text-[#1a1a1a]">ЖИЗНЬ ВМЕСТЕ</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-[#737373] text-lg max-w-sm"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Свежие впечатления, эмоции, приключения в компании новых людей
        </motion.p>
      </div>

      <div className="px-6 pb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 rounded-full bg-[#E86A5C] text-white text-lg font-semibold shadow-lg"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Начать
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-xs text-[#737373] mt-4 px-4"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Нажимая на кнопку, вы даете{" "}
          <a href="#" className="underline">
            согласие на обработку персональных данных
          </a>{" "}
          и соглашаетесь с{" "}
          <a href="#" className="underline">
            политикой конфиденциальности
          </a>
        </motion.p>
      </div>
    </div>
  );
}

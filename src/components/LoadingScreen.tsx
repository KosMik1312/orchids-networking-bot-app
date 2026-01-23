"use client";

import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Загрузка..." }: LoadingScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#E9E9E9" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Container (Floating Circle) */}
        <motion.div
          className="w-24 h-24 rounded-full bg-[#E15859]/10 flex items-center justify-center relative overflow-hidden shadow-sm"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Pulsing glow background */}
          <motion.div 
            className="absolute inset-0 bg-[#E15859]/5 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo / Spinner */}
          <div className="relative flex items-center justify-center">
            {/* Main Spinner */}
            <motion.div
              className="w-14 h-14 rounded-full border-[3px] border-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                borderTopColor: "#E15859",
                borderRightColor: "#E15859",
              }}
            />
            
            {/* Inner "A" or Stylized Element */}
            <div 
              className="absolute text-[#E15859] font-bold text-2xl select-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              A
            </div>
          </div>
        </motion.div>

        {/* Text and Dots Container */}
        <div className="flex flex-col items-center gap-3">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-[#404243] text-lg font-medium"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {message}
          </motion.p>

          {/* Dynamic Dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#E15859]"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3] 
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

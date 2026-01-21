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
        {/* Spinner */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-[#E15859]/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            borderRightColor: "#E15859",
            borderTopColor: "#E15859",
          }}
        />

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-[#404243] text-lg font-semibold"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {message}
        </motion.p>

        {/* Dots animation */}
        <motion.div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#E15859]"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorScreenProps {
  message?: string;
  title?: string;
}

export function ErrorScreen({ 
  title = "Ошибка",
  message = "Не удалось получить данные пользователя. Пожалуйста, откройте приложение через Telegram."
}: ErrorScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
      style={{ backgroundColor: "#FFF7EF" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        {/* Error Icon */}
        <motion.div
          className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertCircle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Title */}
        <h1
          className="text-[#E15859] text-2xl font-bold"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {title}
        </h1>

        {/* Message */}
        <p className="text-[#404243] text-base leading-relaxed max-w-sm">
          {message}
        </p>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
        >
          💡 Убедитесь, что вы открыли приложение из Telegram бота, или используйте ссылку с параметром <code>?userId=YOUR_ID</code>
        </motion.div>
      </motion.div>
    </div>
  );
}

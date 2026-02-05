"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ru } from "@/lib/i18n";
import { IMAGE_PATHS } from "@/lib/images";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const texts = ru.onboarding;
  const totalSlides = texts.slides.length;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-x-hidden"
      style={{ touchAction: "pan-y" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGE_PATHS.onboarding.step1})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center items-center px-4">
        {/* Card with Next Button */}
        <div className="relative w-full flex items-center justify-center">
          {/* White Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[32px] px-6 py-8 w-full max-w-[280px] relative"
            style={{ minHeight: "240px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                {/* Title */}
                <h2
                  className="text-[#E15859] text-[24px] font-black uppercase tracking-wide mb-4 text-center"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {texts.slides[currentSlide].title}
                </h2>

                {/* Scrollable Text */}
                <div
                  className="overflow-y-auto max-h-[140px] w-full"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <p
                    className="text-[#2A2021] text-[16px] text-center leading-relaxed"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {texts.slides[currentSlide].text}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Next Button - positioned outside the card */}
          {currentSlide < totalSlides - 1 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="absolute right-0 w-[56px] h-[56px] rounded-full bg-[#E15859] flex items-center justify-center shadow-lg"
              style={{ transform: "translateX(28px)" }}
            >
              <ChevronRight className="w-7 h-7 text-white" />
            </motion.button>
          )}
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-[10px] h-[10px] rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 px-10 pb-10">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={onComplete}
          className="w-full py-[22px] rounded-full bg-[#E15859] text-white text-[20px] font-medium"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {texts.button}
        </motion.button>
      </div>
    </div>
  );
}

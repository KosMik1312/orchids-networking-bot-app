"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { IMAGE_PATHS } from "@/lib/images";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  image: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "РАССКАЖИ О СЕБЕ",
    description: "Заполни короткую анкету и мы найдем тебе подходящих собеседников",
    image: IMAGE_PATHS.onboarding.step1,
  },
  {
    id: 2,
    title: "ПОДБИРАЕМ КОМПАНИЮ",
    description: "Наш алгоритм учитывает возраст, стиль общения, темперамент и другие нюансы",
    image: IMAGE_PATHS.onboarding.step2,
  },
  {
    id: 3,
    title: "МЫ ВСЁ ОРГАНИЗУЕМ",
    description: "Создаем развлекательную программу для вашей компании, где позитивные эмоции и общие интересы объединяют",
    image: IMAGE_PATHS.onboarding.step3,
  },
  {
    id: 4,
    title: "ДЕНЬ X",
    description: "Идеально для каждого! Наслаждайтесь вечером с людьми, которые разделяют ваш интерес, цели и желания",
    image: IMAGE_PATHS.onboarding.step4,
  },
];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 px-4 pt-4">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        const isLast = i === totalSteps - 1;

        return (
          <div key={stepNum} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                ${
                  isActive || isCompleted
                    ? "text-white"
                    : "bg-transparent border-2 border-white text-white"
                }
              `}
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                backgroundColor: (isActive || isCompleted) ? "#E15859" : "transparent"
              }}
            >
              {stepNum}
            </motion.div>
            {!isLast && (
              <div
                className={`w-6 h-[2px] ${
                  stepNum < currentStep ? "bg-[#E15859]" : "bg-white"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface OnboardingScreenProps {
  onComplete: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function OnboardingScreen({
  onComplete,
  currentStep,
  onStepChange,
}: OnboardingScreenProps) {
  const step = onboardingSteps[currentStep - 1];
  const isLastStep = currentStep === onboardingSteps.length;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black">
      <motion.div
        key={step.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${step.image})` }}
        />
        {/* Градиенты согласно спецификации */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(0deg, rgba(0, 0, 0, 0) 69.16%, #000000 100%)"
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 39.03%, #000000 80.01%)"
          }}
        />
      </motion.div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <StepIndicator currentStep={currentStep} totalSteps={onboardingSteps.length} />

        <div className="flex-1" />

        <motion.div
          key={`content-${step.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="px-6 pb-6"
        >
          <h2
            className="text-3xl font-extrabold text-white text-center mb-3 tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {step.title}
          </h2>
          <p
            className="text-white/80 text-center text-base leading-relaxed max-w-sm mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {step.description}
          </p>
        </motion.div>

        <div className="px-6 pb-8">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: "#E15859",
                  border: "none"
                }}
              >
                <ChevronLeft className="w-6 h-6" style={{ color: "#FFFFFF" }} />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex-1 py-4 rounded-full text-white text-lg font-semibold"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                backgroundColor: "#E15859"
              }}
            >
              Далее
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

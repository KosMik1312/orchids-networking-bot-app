"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";

type Screen = "welcome" | "quiz" | "onboarding" | "main";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(1);

  const handleStartQuiz = () => {
    setCurrentScreen("quiz");
  };

  const handleQuizComplete = (name: string) => {
    setUserName(name);
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen("main");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentScreen === "onboarding" ? "#000000" : "#E9E9E9" }}>
      <AnimatePresence mode="wait">
        {currentScreen === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <WelcomeScreen onStart={handleStartQuiz} />
          </motion.div>
        )}

        {currentScreen === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <QuizScreen 
              onNext={handleQuizComplete} 
              onBack={() => setCurrentScreen("welcome")} 
            />
          </motion.div>
        )}

        {currentScreen === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OnboardingScreen
              currentStep={onboardingStep}
              onStepChange={setOnboardingStep}
              onComplete={handleOnboardingComplete}
            />
          </motion.div>
        )}

        {currentScreen === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: "#E9E9E9" }}
          >
            <div className="text-center">
              <h1
                className="font-serif text-4xl italic text-[#E86A5C] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Аллора Клаб
              </h1>
              <p
                className="text-[#737373] text-lg mb-8"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Онбординг завершён!
                <br />
                Здесь будет анкета и список мероприятий.
              </p>
              <button
                onClick={() => {
                  setCurrentScreen("welcome");
                  setOnboardingStep(1);
                }}
                className="px-8 py-3 rounded-full bg-[#E86A5C] text-white font-semibold"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Начать заново
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

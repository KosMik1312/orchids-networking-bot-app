"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";

type Screen = "welcome" | "onboarding" | "quiz" | "main";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(1);

  const handleStartOnboarding = () => {
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen("quiz");
  };

  const handleQuizComplete = (name: string) => {
    setUserName(name);
    setCurrentScreen("main");
  };

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome");
    setOnboardingStep(1);
  };

  const handleBackToOnboarding = () => {
    setCurrentScreen("onboarding");
    setOnboardingStep(4);
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
            <WelcomeScreen onStart={handleStartOnboarding} />
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
              onBack={handleBackToWelcome}
            />
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
              onBack={handleBackToOnboarding} 
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
                className="font-serif text-4xl italic text-[#E15859] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Аллора Клаб
              </h1>
              <p
                className="text-[#404243] text-lg mb-8"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {userName ? `${userName}, онбординг завершён!` : "Онбординг завершён!"}
                <br />
                Здесь будет анкета и список мероприятий.
              </p>
              <button
                onClick={() => {
                  setCurrentScreen("welcome");
                  setOnboardingStep(1);
                  setUserName("");
                }}
                className="px-8 py-3 rounded-full bg-[#E15859] text-white font-semibold"
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

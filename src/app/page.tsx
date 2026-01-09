"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { AgeSelectionScreen } from "@/components/AgeSelectionScreen";
import { GenderSelectionScreen } from "@/components/GenderSelectionScreen";
import { RelationshipStatusScreen, type RelationshipStatus } from "@/components/RelationshipStatusScreen";

type Screen = "welcome" | "onboarding" | "quiz" | "age" | "gender" | "relationship" | "main";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState<number>(25);
  const [userGender, setUserGender] = useState<"male" | "female" | null>(null);
  const [userRelationship, setUserRelationship] = useState<RelationshipStatus | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const handleStartOnboarding = () => {
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen("quiz");
  };

  const handleQuizComplete = (name: string) => {
    setUserName(name);
    setCurrentScreen("age");
  };

  const handleAgeComplete = (age: number) => {
    setUserAge(age);
    setCurrentScreen("gender");
  };

  const handleGenderComplete = (gender: "male" | "female") => {
    setUserGender(gender);
    setCurrentScreen("relationship");
  };

  const handleRelationshipComplete = (status: RelationshipStatus) => {
    setUserRelationship(status);
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

  const handleBackToQuiz = () => {
    setCurrentScreen("quiz");
  };

  const handleBackToAge = () => {
    setCurrentScreen("age");
  };

  const handleBackToGender = () => {
    setCurrentScreen("gender");
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
              progress={25}
            />
          </motion.div>
        )}

        {currentScreen === "age" && (
          <motion.div
            key="age"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <AgeSelectionScreen 
              onNext={handleAgeComplete} 
              onBack={handleBackToQuiz}
              progress={50}
            />
          </motion.div>
        )}

        {currentScreen === "gender" && (
          <motion.div
            key="gender"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <GenderSelectionScreen 
              onNext={handleGenderComplete} 
              onBack={handleBackToAge}
              progress={75}
            />
          </motion.div>
        )}

        {currentScreen === "relationship" && (
          <motion.div
            key="relationship"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <RelationshipStatusScreen 
              onNext={handleRelationshipComplete} 
              onBack={handleBackToGender}
              progress={100}
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
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ backgroundColor: "#E9E9E9" }}
          >
            <div className="max-w-md w-full">
              <h1
                className="font-serif text-4xl italic text-[#E15859] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Аллора Клаб
              </h1>
              <div
                className="text-[#404243] text-lg mb-8 space-y-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <p className="font-bold text-xl mb-4">
                  {userName ? `${userName}, онбординг завершён!` : "Онбординг завершён!"}
                </p>
                <p>Возраст: {userAge}</p>
                <p>Пол: {userGender === "male" ? "Мужской" : "Женский"}</p>
                <p>
                  Статус: {
                    userRelationship === "in_relationship" ? "В отношениях / в браке" :
                    userRelationship === "single" ? "Без партнера" :
                    "Не указано"
                  }
                </p>
                <p className="mt-6 text-sm opacity-70">Здесь будет анкета и список мероприятий.</p>
              </div>
              <button
                onClick={() => {
                  setCurrentScreen("welcome");
                  setOnboardingStep(1);
                  setUserName("");
                  setUserAge(25);
                  setUserGender(null);
                  setUserRelationship(null);
                }}
                className="px-8 py-4 rounded-full bg-[#E15859] text-white font-semibold text-lg shadow-lg hover:bg-[#d14849] transition-all"
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

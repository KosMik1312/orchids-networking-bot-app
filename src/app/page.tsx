"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { AgeSelectionScreen } from "@/components/AgeSelectionScreen";
import { GenderSelectionScreen } from "@/components/GenderSelectionScreen";
import { RelationshipStatusScreen, type RelationshipStatus } from "@/components/RelationshipStatusScreen";
import { ChildrenSelectionScreen, type ChildrenStatus } from "@/components/ChildrenSelectionScreen";
import { OccupationSelectionScreen, type OccupationType } from "@/components/OccupationSelectionScreen";
import { GoalSelectionScreen, type GoalType } from "@/components/GoalSelectionScreen";
import { InterestsSelectionScreen, type InterestType } from "@/components/InterestsSelectionScreen";
import { ComfortSelectionScreen } from "@/components/ComfortSelectionScreen";

type Screen = "welcome" | "onboarding" | "quiz" | "age" | "gender" | "relationship" | "children" | "occupation" | "goal" | "interests" | "comfort" | "main";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState<number>(25);
  const [userGender, setUserGender] = useState<"male" | "female" | null>(null);
  const [userRelationship, setUserRelationship] = useState<RelationshipStatus | null>(null);
  const [userChildren, setUserChildren] = useState<ChildrenStatus | null>(null);
  const [userOccupation, setUserOccupation] = useState<OccupationType | null>(null);
  const [userGoal, setUserGoal] = useState<GoalType | null>(null);
  const [userInterest, setUserInterest] = useState<InterestType | null>(null);
  const [userComfort, setUserComfort] = useState<number | null>(null);
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
    setCurrentScreen("children");
  };

  const handleChildrenComplete = (status: ChildrenStatus) => {
    setUserChildren(status);
    setCurrentScreen("occupation");
  };

  const handleOccupationComplete = (occupation: OccupationType) => {
    setUserOccupation(occupation);
    setCurrentScreen("goal");
  };

  const handleGoalComplete = (goal: GoalType) => {
    setUserGoal(goal);
    setCurrentScreen("interests");
  };

  const handleInterestsComplete = (interest: InterestType) => {
    setUserInterest(interest);
    setCurrentScreen("comfort");
  };

  const handleComfortComplete = (level: number) => {
    setUserComfort(level);
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

  const handleBackToRelationship = () => {
    setCurrentScreen("relationship");
  };

  const handleBackToChildren = () => {
    setCurrentScreen("children");
  };

  const handleBackToOccupation = () => {
    setCurrentScreen("occupation");
  };

  const handleBackToGoal = () => {
    setCurrentScreen("goal");
  };

  const handleBackToInterests = () => {
    setCurrentScreen("interests");
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
              progress={11}
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
              progress={22}
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
              progress={33}
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
              progress={44}
            />
          </motion.div>
        )}

        {currentScreen === "children" && (
          <motion.div
            key="children"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <ChildrenSelectionScreen 
              onNext={handleChildrenComplete} 
              onBack={handleBackToRelationship}
              progress={55}
            />
          </motion.div>
        )}

        {currentScreen === "occupation" && (
          <motion.div
            key="occupation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <OccupationSelectionScreen 
              onNext={handleOccupationComplete} 
              onBack={handleBackToChildren}
              progress={66}
            />
          </motion.div>
        )}

        {currentScreen === "goal" && (
          <motion.div
            key="goal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <GoalSelectionScreen 
              onNext={handleGoalComplete} 
              onBack={handleBackToOccupation}
              progress={77}
            />
          </motion.div>
        )}

        {currentScreen === "interests" && (
          <motion.div
            key="interests"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <InterestsSelectionScreen 
              onNext={handleInterestsComplete} 
              onBack={handleBackToGoal}
              progress={88}
            />
          </motion.div>
        )}

        {currentScreen === "comfort" && (
          <motion.div
            key="comfort"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <ComfortSelectionScreen 
              onNext={handleComfortComplete} 
              onBack={handleBackToInterests}
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
                <p>
                  Дети: {
                    userChildren === "yes" ? "Есть" :
                    userChildren === "no" ? "Нет" :
                    "Не указано"
                  }
                </p>
                <p>
                  Сфера: {
                    userOccupation === "unemployed" ? "Не работаю" :
                    userOccupation === "it" ? "IT и технологии" :
                    userOccupation === "retail" ? "Торговля и ритейл" :
                    userOccupation === "education" ? "Образование и наука" :
                    userOccupation === "government" ? "Госслужба и политика" :
                    userOccupation === "transport" ? "Транспорт и логистика" :
                    userOccupation === "finance" ? "Финансы и юриспруденция" :
                    userOccupation === "services" ? "Сфера услуг" :
                    userOccupation === "production" ? "Производство" :
                    userOccupation === "hospitality" ? "Гостеприимство" :
                    userOccupation === "marketing" ? "Маркетинг" :
                    userOccupation === "other" ? "Другое" :
                    "Не указано"
                  }
                </p>
                <p>
                  Цель: {
                    userGoal === "experience" ? "Новый опыт" :
                    userGoal === "emotions" ? "Яркие эмоции" :
                    userGoal === "friends" ? "Новые друзья" :
                    "Не указано"
                  }
                </p>
                <p>
                  Интерес: {
                    userInterest === "sport" ? "Спорт" :
                    userInterest === "culture" ? "Культурный отдых" :
                    userInterest === "extreme" ? "Экстрим" :
                    userInterest === "gatherings" ? "Душевные посиделки" :
                    userInterest === "board_games" ? "Настольные игры" :
                    userInterest === "excitement" ? "Азарт" :
                    "Не указано"
                  }
                </p>
                <p>Комфорт в компании: {userComfort || "Не указано"}/5</p>
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
                    setUserChildren(null);
                    setUserOccupation(null);
                    setUserGoal(null);
                    setUserInterest(null);
                    setUserComfort(null);
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

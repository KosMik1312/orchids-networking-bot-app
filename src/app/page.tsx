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
import { SocialFrequencyScreen } from "@/components/SocialFrequencyScreen";
import { CommunicationFormatScreen, type CommunicationFormat } from "@/components/CommunicationFormatScreen";
import { EveningScenarioScreen, type EveningScenario } from "@/components/EveningScenarioScreen";
import { SocialLinksScreen } from "@/components/SocialLinksScreen";
import { PhotoUploadScreen } from "@/components/PhotoUploadScreen";
import { AboutMeScreen } from "@/components/AboutMeScreen";
import { CitySelectionScreen } from "@/components/CitySelectionScreen";

type Screen = "welcome" | "onboarding" | "quiz" | "age" | "gender" | "relationship" | "children" | "occupation" | "goal" | "interests" | "comfort" | "social_frequency" | "communication_format" | "evening_scenario" | "social_links" | "photo_upload" | "about_me" | "city" | "main";

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
  const [userSocialFrequency, setUserSocialFrequency] = useState<number | null>(null);
  const [userCommunicationFormat, setUserCommunicationFormat] = useState<CommunicationFormat | null>(null);
  const [userEveningScenario, setUserEveningScenario] = useState<EveningScenario | null>(null);
  const [userSocialLinks, setUserSocialLinks] = useState<{ telegram: string; instagram: string }>({ telegram: "", instagram: "" });
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userAboutMe, setUserAboutMe] = useState("");
  const [userCity, setUserCity] = useState("");
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
    setCurrentScreen("social_frequency");
  };

  const handleSocialFrequencyComplete = (level: number) => {
    setUserSocialFrequency(level);
    setCurrentScreen("communication_format");
  };

  const handleCommunicationFormatComplete = (format: CommunicationFormat) => {
    setUserCommunicationFormat(format);
    setCurrentScreen("evening_scenario");
  };

  const handleEveningScenarioComplete = (scenario: EveningScenario) => {
    setUserEveningScenario(scenario);
    setCurrentScreen("social_links");
  };

  const handleSocialLinksComplete = (socials: { telegram: string; instagram: string }) => {
    setUserSocialLinks(socials);
    setCurrentScreen("photo_upload");
  };

  const handlePhotoUploadComplete = (photo: string) => {
    setUserPhoto(photo);
    setCurrentScreen("about_me");
  };

  const handleAboutMeComplete = (about: string) => {
    setUserAboutMe(about);
    setCurrentScreen("city");
  };

  const handleCityComplete = (city: string) => {
    setUserCity(city);
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

  const handleBackToComfort = () => {
    setCurrentScreen("comfort");
  };

  const handleBackToSocialFrequency = () => {
    setCurrentScreen("social_frequency");
  };

  const handleBackToCommunicationFormat = () => {
    setCurrentScreen("communication_format");
  };

  const handleBackToEveningScenario = () => {
    setCurrentScreen("evening_scenario");
  };

  const handleBackToSocialLinks = () => {
    setCurrentScreen("social_links");
  };

  const handleBackToPhotoUpload = () => {
    setCurrentScreen("photo_upload");
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
              progress={6}
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
              progress={13}
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
              progress={20}
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
              progress={26}
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
              progress={33}
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
              progress={40}
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
              progress={46}
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
              progress={53}
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
              progress={60}
            />
          </motion.div>
        )}

        {currentScreen === "social_frequency" && (
          <motion.div
            key="social_frequency"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <SocialFrequencyScreen 
              onNext={handleSocialFrequencyComplete} 
              onBack={handleBackToComfort}
              progress={66}
            />
          </motion.div>
        )}

        {currentScreen === "communication_format" && (
          <motion.div
            key="communication_format"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <CommunicationFormatScreen 
              onNext={handleCommunicationFormatComplete} 
              onBack={handleBackToSocialFrequency}
              progress={73}
            />
          </motion.div>
        )}

        {currentScreen === "evening_scenario" && (
          <motion.div
            key="evening_scenario"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <EveningScenarioScreen 
              onNext={handleEveningScenarioComplete} 
              onBack={handleBackToCommunicationFormat}
              progress={80}
            />
          </motion.div>
        )}

        {currentScreen === "social_links" && (
          <motion.div
            key="social_links"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <SocialLinksScreen 
              onNext={handleSocialLinksComplete} 
              onBack={handleBackToEveningScenario}
              progress={86}
            />
          </motion.div>
        )}

        {currentScreen === "photo_upload" && (
          <motion.div
            key="photo_upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <PhotoUploadScreen 
              onNext={handlePhotoUploadComplete} 
              onBack={handleBackToSocialLinks}
              progress={93}
            />
          </motion.div>
        )}

        {currentScreen === "about_me" && (
          <motion.div
            key="about_me"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <AboutMeScreen 
              onNext={handleAboutMeComplete} 
              onBack={handleBackToPhotoUpload}
              progress={100}
            />
          </motion.div>
        )}

        {currentScreen === "city" && (
          <motion.div
            key="city"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <CitySelectionScreen 
              onNext={handleCityComplete} 
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
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-12"
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
                className="text-[#404243] text-lg mb-8 space-y-2 text-left"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {userPhoto && (
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E15859]">
                      <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <p className="font-bold text-xl mb-4 text-center">
                  {userName ? `${userName}, онбординг завершён!` : "Онбординг завершён!"}
                </p>
                <div className="space-y-1 bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <p><b>Возраст:</b> {userAge}</p>
                  <p><b>Пол:</b> {userGender === "male" ? "Мужской" : "Женский"}</p>
                  <p><b>Город:</b> {userCity || "Не указано"}</p>
                  <p>
                    <b>Статус:</b> {
                      userRelationship === "in_relationship" ? "В отношениях / в браке" :
                      userRelationship === "single" ? "Без партнера" :
                      "Не указано"
                    }
                  </p>
                  <p>
                    <b>Дети:</b> {
                      userChildren === "yes" ? "Есть" :
                      userChildren === "no" ? "Нет" :
                      "Не указано"
                    }
                  </p>
                  <p>
                    <b>Сфера:</b> {
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
                </div>

                <div className="space-y-1 bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <p>
                    <b>Цель:</b> {
                      userGoal === "experience" ? "Новый опыт" :
                      userGoal === "emotions" ? "Яркие эмоции" :
                      userGoal === "friends" ? "Новые друзья" :
                      "Не указано"
                    }
                  </p>
                  <p>
                    <b>Интерес:</b> {
                      userInterest === "sport" ? "Спорт" :
                      userInterest === "culture" ? "Культурный отдых" :
                      userInterest === "extreme" ? "Экстрим" :
                      userInterest === "gatherings" ? "Душевные посиделки" :
                      userInterest === "board_games" ? "Настольные игры" :
                      userInterest === "excitement" ? "Азарт" :
                      "Не указано"
                    }
                  </p>
                  <p><b>Комфорт:</b> {userComfort || "Не указано"}/5</p>
                  <p><b>Знакомства:</b> {userSocialFrequency || "Не указано"}/5</p>
                </div>

                <div className="space-y-1 bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <p>
                    <b>Формат:</b> {
                      userCommunicationFormat === "light" ? "Лёгкое общение" :
                      userCommunicationFormat === "active" ? "Активный отдых" :
                      "Не указано"
                    }
                  </p>
                  <p>
                    <b>Вечер:</b> {
                      userEveningScenario === "calm" ? "Спокойная встреча" :
                      userEveningScenario === "spontaneous" ? "Приключение" :
                      "Не указано"
                    }
                  </p>
                  {userSocialLinks.telegram && <p><b>Telegram:</b> {userSocialLinks.telegram}</p>}
                  {userSocialLinks.instagram && <p><b>Instagram:</b> {userSocialLinks.instagram}</p>}
                </div>

                {userAboutMe && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                    <p className="font-bold mb-1">О себе:</p>
                    <p className="italic text-sm leading-relaxed">&quot;{userAboutMe}&quot;</p>
                  </div>
                )}
                
                <p className="mt-6 text-sm opacity-70 text-center italic">Здесь будет анкета и список мероприятий.</p>
              </div>
              <div className="flex justify-center">
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
                    setUserSocialFrequency(null);
                    setUserCommunicationFormat(null);
                    setUserEveningScenario(null);
                    setUserSocialLinks({ telegram: "", instagram: "" });
                    setUserPhoto(null);
                    setUserAboutMe("");
                    setUserCity("");
                  }}
                  className="px-8 py-4 rounded-full bg-[#E15859] text-white font-semibold text-lg shadow-lg hover:bg-[#d14849] transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Начать заново
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

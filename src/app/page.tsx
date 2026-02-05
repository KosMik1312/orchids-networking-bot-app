"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { ProfileFormScreen } from "@/components/ProfileFormScreen";
import { BestInMeScreen } from "@/components/BestInMeScreen";
import { MeetingConditionsScreen } from "@/components/MeetingConditionsScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BookingScreen } from "@/components/BookingScreen";
import { getProfile, saveProfile, type UserProfile } from "@/lib/api";

type Screen = "welcome" | "onboarding" | "profile_form" | "best_in_me" | "meeting_conditions" | "quiz" | "booking";

interface MeetingConditionsData {
  metro: string[];
  days: string[];
  time: { from: string; to: string };
  goal: string;
  format: string;
}

const DEV_SKIP_PROFILE_LOADING = true;

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [userName, setUserName] = useState("");
  const [userGender, setUserGender] = useState<"male" | "female" | null>(null);
  const [userSocialLinks, setUserSocialLinks] = useState({ telegram: "", instagram: "" });
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userMeetingConditions, setUserMeetingConditions] = useState<Partial<MeetingConditionsData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userId || isSaving) return;
    setIsSaving(true);
    try {
      await saveProfile(userId, data);
    } catch (error) {
      console.error('❌ Failed to save profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (DEV_SKIP_PROFILE_LOADING) {
      setUserId(123456789);
      setIsLoading(false);
      setProfileLoaded(true);
      setCurrentScreen("welcome");
      return;
    }

    let isMounted = true;
    async function tryLoadProfile(foundId: number, authToken?: string) {
      setUserId(foundId);
      try {
        const result = await getProfile(foundId, authToken);
        const profile = (result as any)?.profile ?? (result as any);
        if (!isMounted) return;
        if (profile) {
          setUserName(profile.name || "");
          setUserGender((profile.gender as "male" | "female") || null);
          setProfileLoaded(true);
          setCurrentScreen("welcome");
        }
      } catch (error) {
        if (!isMounted) return;
        setCurrentScreen("welcome");
        setProfileLoaded(true);
      } finally {
        setIsLoading(false);
      }
    }

    function getTelegramId() {
      const webApp = (window as any).Telegram?.WebApp;
      return webApp?.initDataUnsafe?.user?.id;
    }

    if (userId) {
      setIsLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ user_id: number }>(token);
        tryLoadProfile(decoded.user_id, token);
        return;
      } catch (e) {}
    }

    let foundId = getTelegramId();
    if (foundId) {
      tryLoadProfile(foundId);
      return;
    }

    pollingRef.current = setInterval(() => {
      const id = getTelegramId();
      if (id) {
        clearInterval(pollingRef.current!);
        tryLoadProfile(id);
      }
    }, 200);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userId]);

  const handleStartOnboarding = () => setCurrentScreen("onboarding");
  const handleOnboardingComplete = () => setCurrentScreen("profile_form");

  const handleProfileFormComplete = async (data: any) => {
    const genderValue = data.gender === "Мужской" ? "male" : "female";
    setUserName(data.name);
    setUserGender(genderValue);
    setCurrentScreen("best_in_me");
    updateProfile({ name: data.name, gender: genderValue });
  };

  const handleBestInMeComplete = async (data: any) => {
    setUserSocialLinks({ telegram: data.telegramNickname, instagram: data.instagramNickname });
    if (data.photo) setUserPhoto(data.photo);
    setCurrentScreen("meeting_conditions");
    updateProfile({ 
      telegram: data.telegramNickname, 
      instagram: data.instagramNickname, 
      photo: data.photo || undefined 
    });
  };

  const handleMeetingConditionsComplete = async (data: MeetingConditionsData) => {
    setUserMeetingConditions(data);
    setCurrentScreen("booking");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentScreen === "onboarding" ? "#000000" : "#E9E9E9" }}>
      <AnimatePresence mode="wait">
        {isLoading && !profileLoaded && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
            <LoadingScreen message="Профиль загружается..." />
          </motion.div>
        )}

        {profileLoaded && (
          <>
            {currentScreen === "welcome" && (
              <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WelcomeScreen onStart={handleStartOnboarding} />
              </motion.div>
            )}

            {currentScreen === "onboarding" && (
              <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <OnboardingScreen onComplete={handleOnboardingComplete} />
              </motion.div>
            )}

            {currentScreen === "profile_form" && (
              <motion.div key="profile_form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileFormScreen onContinue={handleProfileFormComplete} onBack={() => setCurrentScreen("onboarding")} />
              </motion.div>
            )}

            {currentScreen === "best_in_me" && (
              <motion.div key="best_in_me" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BestInMeScreen onContinue={handleBestInMeComplete} onBack={() => setCurrentScreen("profile_form")} />
              </motion.div>
            )}

            {currentScreen === "meeting_conditions" && (
              <motion.div key="meeting_conditions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MeetingConditionsScreen
                  onContinue={handleMeetingConditionsComplete}
                  onBack={() => setCurrentScreen("best_in_me")}
                  initialData={userMeetingConditions}
                />
              </motion.div>
            )}

            {currentScreen === "quiz" && (
                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <QuizScreen onNext={() => {
                    console.log("Moving to booking screen");
                    setCurrentScreen("booking");
                  }} onBack={() => setCurrentScreen("meeting_conditions")} progress={6} />
                </motion.div>
              )}

              {currentScreen === "booking" && (
                <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <BookingScreen 
                    city="Москва" 
                    onBack={() => setCurrentScreen("quiz")} 
                    onComplete={() => {}}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

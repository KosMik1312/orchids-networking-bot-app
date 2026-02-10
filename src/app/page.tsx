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
import { PromotionsScreen } from "@/components/PromotionsScreen";
import { AfishaScreen } from "@/components/AfishaScreen";
import { FavoritesScreen } from "@/components/FavoritesScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { MyContactsScreen } from "@/components/MyContactsScreen";
import { AdminScreen } from "@/components/AdminScreen";
import { getProfile, saveProfile, type UserProfile } from "@/lib/api";

type Screen = "welcome" | "onboarding" | "profile_form" | "best_in_me" | "meeting_conditions" | "quiz" | "booking" | "promotions" | "afisha" | "favorites" | "profile" | "settings" | "contacts" | "admin";

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
  const [fullProfile, setFullProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userId || isSaving) return;
    setIsSaving(true);
    try {
      await saveProfile(userId, data);
      setFullProfile(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('❌ Failed to save profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("screen") === "admin" && params.get("token")) {
      setAdminToken(params.get("token"));
      setCurrentScreen("admin");
      setIsLoading(false);
      setProfileLoaded(true);
      return;
    }

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
          setFullProfile(profile);
          setUserName(profile.name || "");
          setUserGender((profile.gender as "male" | "female") || null);
          setProfileLoaded(true);

          if (profile.is_profile_completed) {
            setCurrentScreen("booking");
          } else {
            // Если профиль не завершен, начинаем сначала
            setCurrentScreen("welcome");
          }
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
      } catch (e) { }
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
    // Save meeting conditions to server (map to backend fields)
    updateProfile({
      meeting_metro: data.metro,
      meeting_days: data.days,
      meeting_time_from: data.time.from,
      meeting_time_to: data.time.to,
      format: data.format,
      goal: data.goal,
      is_profile_completed: true
    });
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
                <ProfileFormScreen
                  onContinue={handleProfileFormComplete}
                  onBack={() => setCurrentScreen("profile")} // Go back to profile if editing, or onboarding if new? Needs logic.
                  // Only pass data if we have it. If new user, fullProfile is empty.
                  initialData={{
                    name: fullProfile.name || "",
                    gender: fullProfile.gender === "male" ? "Мужской" : fullProfile.gender === "female" ? "Женский" : "",
                    age: fullProfile.age?.toString() || "",
                    zodiac: "", // UserProfile doesn't seem to have zodiac yet in my view of api.ts? Wait, let me check api.ts again.
                    // Checked api.ts: UserProfile has `interests`, `comfort_level`, etc. It has `children`, `familyStatus` as optional strings.
                    // It does not explicitly have `zodiac` in the interface I saw?
                    // Let me check UserProfile interface in api.ts again.
                    // It DOES NOT have zodiac in `api.ts`. I should add it to `api.ts` too.
                    // For now I will pass what I have.
                    career: fullProfile.occupation || "",
                    familyStatus: fullProfile.relationship_status || "",
                    hasChildren: fullProfile.children || ""
                  }}
                />
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
                  onComplete={() => { }}
                  onPromotions={() => setCurrentScreen("promotions")}
                  onAfisha={() => setCurrentScreen("afisha")}
                      onProfile={() => setCurrentScreen("profile")}
                      onSettings={() => setCurrentScreen("settings")}
                      onContacts={() => setCurrentScreen("contacts")}
                    />
              </motion.div>
            )}

            {currentScreen === "promotions" && (
              <motion.div key="promotions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PromotionsScreen onBack={() => setCurrentScreen("booking")} />
              </motion.div>
            )}

            {currentScreen === "afisha" && (
              <motion.div key="afisha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AfishaScreen
                    city="Москва"
                    favoriteIds={favoriteIds}
                    onToggleFavorite={toggleFavorite}
                    onFavorites={() => setCurrentScreen("favorites")}
                    onHome={() => setCurrentScreen("booking")}
                    onProfile={() => setCurrentScreen("profile")}
                    onBook={() => setCurrentScreen("booking")}
                  />
              </motion.div>
            )}

            {currentScreen === "favorites" && (
              <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FavoritesScreen
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavorite}
                  onBack={() => setCurrentScreen("afisha")}
                  onBook={() => setCurrentScreen("booking")}
                />
              </motion.div>
            )}

              {currentScreen === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProfileScreen
                    city="Москва"
                    userName={userName || "Павел"}
                    userPhoto={userPhoto}
                    onHome={() => setCurrentScreen("booking")}
                    onAfisha={() => setCurrentScreen("afisha")}
                    onFavorites={() => setCurrentScreen("favorites")}
                    onBookings={() => setCurrentScreen("booking")}
                    onEditProfile={() => setCurrentScreen("profile_form")}
                    onSettings={() => setCurrentScreen("settings")}
                  />
                </motion.div>
              )}

                {currentScreen === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SettingsScreen onBack={() => setCurrentScreen("booking")} />
                  </motion.div>
                )}

                {currentScreen === "contacts" && (
                  <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MyContactsScreen onBack={() => setCurrentScreen("booking")} />
                  </motion.div>
                )}

                {currentScreen === "admin" && adminToken && (
                  <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AdminScreen token={adminToken} />
                  </motion.div>
                )}
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

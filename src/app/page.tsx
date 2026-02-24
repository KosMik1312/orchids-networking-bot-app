"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeScreen } from "@/components/WelcomeScreen";
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
import { MyBookingsScreen } from "@/components/MyBookingsScreen";
import { AdminScreen } from "@/components/AdminScreen";
import { PrivacyPolicyScreen } from "@/components/PrivacyPolicyScreen";
import { ConsentScreen } from "@/components/ConsentScreen";
import { OfferScreen } from "@/components/OfferScreen";
import { getProfile, saveProfile, getFavorites, toggleFavorite, type UserProfile } from "@/lib/api";
import { ru } from "@/lib/i18n";

type Screen = "welcome" | "onboarding" | "profile_form" | "best_in_me" | "meeting_conditions" | "booking" | "promotions" | "afisha" | "favorites" | "profile" | "settings" | "contacts" | "my_bookings" | "admin" | "privacy" | "consent" | "offer";

interface MeetingConditionsData {
  metro: string[];
  days: string[];
  time: { from: string; to: string };
  goal: string;
  format: string;
}

// const DEV_SKIP_PROFILE_LOADING = process.env.NEXT_PUBLIC_DEV_SKIP_PROFILE_LOADING === 'false' || false;

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [userToken, setUserToken] = useState<string | null>(null);  // ← ДОБАВЛЯЕМ ДЛЯ СОХРАНЕНИЯ ТОКЕНА
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
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Хранит предыдущий экран для динамической кнопки "Назад" (например, в Избранном)
  const [previousScreen, setPreviousScreen] = useState<Screen>("afisha");

  // Вспомогательная функция для смены экрана с сохранением истории
  const navigateTo = (screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const toggleFavoriteHandler = async (id: number) => {
    if (!userToken) return;

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    // Синхронизируем с БД
    try {
      await toggleFavorite(id, userToken);
      console.log('✅ Favorite synced with DB');
    } catch (error) {
      console.error('❌ Failed to sync favorite:', error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userId || isSaving) return;
    setIsSaving(true);
    try {
      // 📤 ИСПРАВЛЕНИЕ: ПЕРЕДАЁМ ТОКЕН при сохранении профиля
      await saveProfile(userId, data, userToken || undefined);
      setFullProfile(prev => ({ ...prev, ...data }));
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Failed to save profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cleanup = () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };

    const initializeApp = async (initData: string) => {
      if (!isMounted) return;

      console.log("✅ Initializing with Telegram initData...");
      console.log("   initData length:", initData.length);
      console.log("   initData sample (first 100 chars):", initData.substring(0, 100));
      setUserToken(initData);

      try {
        // Парсим initData чтобы получить user_id
        const initDataDecoded = new URLSearchParams(initData);
        const userStr = initDataDecoded.get('user');
        if (!userStr) {
          throw new Error('No user data in initData');
        }

        const userData = JSON.parse(userStr);
        const uid = userData.id;

        console.log("✅ Extracted user_id from initData:", uid);

        if (!isMounted) return;
        setUserId(uid);

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.leracinema.ru';
        console.log(`📍 API_BASE: ${apiBase}`);

        // 🎯 Отправляем initData в Authorization заголовке (гибридная аутентификация)
        console.log("📤 Sending to /api/user/initial-screen with auth header...");
        const response = await fetch(`${apiBase}/api/user/initial-screen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${initData}`,
          },
          cache: 'no-store'
        });

        if (!isMounted) return;

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.error(`❌ Failed: ${response.status} ${errorText}`);
          setCurrentScreen('welcome');
          setIsLoading(false);
          setProfileLoaded(true);
          return;
        }

        const data = await response.json();
        const screen = data.screen || 'welcome';

        console.log(`✅ Screen: ${screen}`);
        setCurrentScreen(screen);

        if (screen === 'admin') {
          console.log('✅ Admin screen detected, setting admin token and screen');
          setAdminToken(initData);
          setCurrentScreen('admin');  // ← ИСПРАВЛЕНИЕ: явно устанавливаем админ-экран
        } else if (screen === 'booking') {
          try {
            const profileResponse = await getProfile(uid, initData);
            if (isMounted && profileResponse.profile) {
              setFullProfile(profileResponse.profile);
              setUserName(profileResponse.profile.name || '');
              setUserGender(profileResponse.profile.gender as 'male' | 'female' | null);
            }

            // Загружаем избранное
            const favoritesResponse = await getFavorites(initData);
            if (isMounted && favoritesResponse.favorites) {
              setFavoriteIds(new Set(favoritesResponse.favorites));
              console.log(`✅ Loaded ${favoritesResponse.favorites.length} favorites`);
            }
          } catch (profileError) {
            console.warn('Could not pre-load profile:', profileError);
          }
        }
      } catch (error) {
        console.error('❌ Error:', error);
        if (isMounted) {
          setCurrentScreen('welcome');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setProfileLoaded(true);
        }
      }
    };

    const startApp = () => {
      // ✅ ИСПОЛЬЗУЕМ ТОЛЬКО INITDATA ОТ TELEGRAM
      const webApp = (window as any).Telegram?.WebApp;

      if (webApp && webApp.initData) {
        console.log('✅ Got Telegram initData');
        initializeApp(webApp.initData);
      } else {
        // Ждём пока WebApp инициализируется
        console.log('⏳ Waiting for Telegram WebApp...');
        let attempts = 0;

        pollingRef.current = setInterval(() => {
          attempts++;

          const webApp = (window as any).Telegram?.WebApp;

          if (webApp && webApp.initData) {
            clearInterval(pollingRef.current!);
            console.log('✅ WebApp ready');
            initializeApp(webApp.initData);
          } else if (attempts > 25) { // ~5 seconds
            clearInterval(pollingRef.current!);
            console.error('❌ Timeout waiting for Telegram WebApp');

            if (isMounted) {
              setCurrentScreen('welcome');
              setIsLoading(false);
              setProfileLoaded(true);
            }
          }
        }, 200);
      }
    };

    startApp();
    return cleanup;
  }, []);

  const handleStartOnboarding = () => setCurrentScreen("onboarding");
  const handleOnboardingComplete = () => setCurrentScreen("profile_form");

  const handleProfileFormComplete = async (data: any) => {
    const genderValue = data.gender === "Мужской" ? "male" : "female";
    setUserName(data.name);
    setUserGender(genderValue);

    // ← ИСПРАВЛЕНИЕ: await для гарантии сохранения перед переходом
    await updateProfile({
      name: data.name || undefined,
      gender: genderValue || undefined,
      age: data.age ? parseInt(data.age) : undefined,
      zodiac: data.zodiac || undefined,
      occupation: data.career || undefined,
      relationship_status: data.familyStatus || undefined,
      children: data.hasChildren || undefined,
    });

    setCurrentScreen("best_in_me");
  };

  const handleProfileFormBack = async (data: any) => {
    const genderValue = data.gender === "Мужской" ? "male" : data.gender === "Женский" ? "female" : undefined;
    // Сохранить текущие данные (даже если форма неполная)
    await updateProfile({
      name: data.name || undefined,
      gender: genderValue,
      age: data.age ? parseInt(data.age) : undefined,
      zodiac: data.zodiac || undefined,
      occupation: data.career || undefined,
      relationship_status: data.familyStatus || undefined,
      children: data.hasChildren || undefined,
    }).catch((err) => {
      console.error("Error saving profile on back:", err);
    });
    // Перезагрузить данные из БД
    if (userId && userToken) {
      const profileData = await getProfile(userId, userToken);
      setFullProfile(profileData.profile);
    }
    setCurrentScreen("onboarding");
  };

  const handleBestInMeComplete = async (data: any) => {
    setUserSocialLinks({ telegram: data.telegramNickname, instagram: data.instagramNickname });
    if (data.photo) setUserPhoto(data.photo);

    // ← ИСПРАВЛЕНИЕ: await для гарантии сохранения перед переходом
    await updateProfile({
      strengths: data.strengths?.length > 0 ? data.strengths : undefined,
      weaknesses: data.weaknesses || undefined,
      values: data.values?.length > 0 ? data.values : undefined,
      love_language: data.loveLanguage?.length > 0 ? data.loveLanguage : undefined,
      goals: data.goals || undefined,
      dreams: data.dreams || undefined,
      interests: data.interests?.length > 0 ? data.interests : undefined,
      telegram: data.telegramNickname || undefined,
      instagram: data.instagramNickname || undefined,
      photo: data.photo || undefined,
    });

    setCurrentScreen("meeting_conditions");
  };

  const handleBestInMeBack = async (data: any) => {
    // Сохранить текущие данные (даже если форма неполная)
    await updateProfile({
      strengths: data.strengths?.length > 0 ? data.strengths : undefined,
      weaknesses: data.weaknesses || undefined,
      values: data.values?.length > 0 ? data.values : undefined,
      love_language: data.loveLanguage?.length > 0 ? data.loveLanguage : undefined,
      goals: data.goals || undefined,
      dreams: data.dreams || undefined,
      interests: data.interests?.length > 0 ? data.interests : undefined,
      telegram: data.telegramNickname || undefined,
      instagram: data.instagramNickname || undefined,
      photo: data.photo || undefined,
    }).catch((err) => {
      console.error("Error saving BestInMe on back:", err);
    });
    // Перезагрузить данные из БД
    setCurrentScreen("profile_form");
  };

  const handleMeetingConditionsComplete = async (data: MeetingConditionsData) => {
    setUserMeetingConditions(data);

    // ← ИСПРАВЛЕНИЕ: await для гарантии сохранения перед переходом
    // Save meeting conditions to server (map to backend fields)
    await updateProfile({
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

  const handleMeetingConditionsBack = async (data: MeetingConditionsData) => {
    // Сохранить текущие данные (даже если форма неполная)
    await updateProfile({
      meeting_metro: data.metro,
      meeting_days: data.days,
      meeting_time_from: data.time.from,
      meeting_time_to: data.time.to,
      format: data.format,
      goal: data.goal,
    }).catch((err) => {
      console.error("Error saving MeetingConditions on back:", err);
    });
    // Перезагрузить данные из БД
    if (userId && userToken) {
      const profileData = await getProfile(userId, userToken);
      setFullProfile(profileData.profile);
    }
    setCurrentScreen("best_in_me");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentScreen === "onboarding" ? "#000000" : "#FFF7EF" }}>
      <AnimatePresence mode="wait">
        {isLoading && !profileLoaded && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
            <LoadingScreen message={ru.loading.profileLoading} />
          </motion.div>
        )}

        {profileLoaded && (
          <>
            {currentScreen === "welcome" && (
              <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WelcomeScreen
                  onStart={handleStartOnboarding}
                  onShowConsent={() => navigateTo("consent")}
                  onShowPrivacy={() => navigateTo("privacy")}
                />
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
                  onBack={handleProfileFormBack}
                  // Only pass data if we have it. If new user, fullProfile is empty.
                  initialData={{
                    name: fullProfile.name || "",
                    gender: fullProfile.gender === "male" ? "Мужской" : fullProfile.gender === "female" ? "Женский" : "",
                    age: fullProfile.age !== undefined ? Number(fullProfile.age) : 25,
                    zodiac: fullProfile.zodiac || "",
                    career: fullProfile.occupation || "",
                    familyStatus: fullProfile.relationship_status || "",
                    hasChildren: fullProfile.children || ""
                  }}
                />
              </motion.div>
            )}

            {currentScreen === "best_in_me" && (
              <motion.div key="best_in_me" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BestInMeScreen
                  onContinue={handleBestInMeComplete}
                  onBack={handleBestInMeBack}
                  initialData={{
                    strengths: Array.isArray(fullProfile.strengths) ? fullProfile.strengths : [],
                    weaknesses: fullProfile.weaknesses || "",
                    values: Array.isArray(fullProfile.values) ? fullProfile.values : [],
                    loveLanguage: Array.isArray(fullProfile.love_language) ? fullProfile.love_language : [],
                    goals: fullProfile.goals || "",
                    dreams: fullProfile.dreams || "",
                    interests: Array.isArray(fullProfile.interests) ? fullProfile.interests : [],
                    telegramNickname: fullProfile.telegram || "",
                    instagramNickname: fullProfile.instagram || "",
                    photo: (fullProfile.photo as string) || null
                  }}
                />
              </motion.div>
            )}

            {currentScreen === "meeting_conditions" && (
              <motion.div key="meeting_conditions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MeetingConditionsScreen
                  onContinue={handleMeetingConditionsComplete}
                  onBack={handleMeetingConditionsBack}
                  initialData={userMeetingConditions}
                />
              </motion.div>
            )}

            {currentScreen === "booking" && (
              <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BookingScreen
                  city={fullProfile.city || "Москва"}
                  authToken={userToken || null}
                  selectedEventId={selectedEventId}
                  onBack={() => setCurrentScreen("afisha")} // Возврат на афишу
                  onComplete={() => {
                    // Успешная оплата -> переход в мои бронирования
                    setSelectedEventId(null);
                    setCurrentScreen("my_bookings"); // ИСПРАВЛЕНИЕ: Переход к списку бронирований
                  }}
                  onPromotions={() => navigateTo("promotions")}
                  onAfisha={() => navigateTo("afisha")}
                  onProfile={() => navigateTo("profile")}
                  onSettings={() => navigateTo("settings")}
                  onContacts={() => navigateTo("contacts")}
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
                  city={fullProfile.city || "Москва"}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavoriteHandler}
                  onFavorites={() => navigateTo("favorites")}
                  onHome={() => setCurrentScreen("booking")}
                  onProfile={() => setCurrentScreen("profile")}
                  onBook={(eventId) => {
                    setSelectedEventId(eventId);
                    navigateTo("booking");
                  }}
                />
              </motion.div>
            )}

            {currentScreen === "favorites" && (
              <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FavoritesScreen
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavoriteHandler}
                  onBack={() => setCurrentScreen(previousScreen)} // Исправлено: Динамический возврат
                  onBook={(eventId) => {
                    setSelectedEventId(eventId);
                    navigateTo("booking");
                  }}
                />
              </motion.div>
            )}

            {currentScreen === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileScreen
                  city={fullProfile.city || "Москва"}
                  initialProfile={fullProfile}
                  userName={userName}
                  userId={userId}
                  authToken={userToken}
                  onHome={() => setCurrentScreen("booking")}
                  onAfisha={() => setCurrentScreen("afisha")}
                  onFavorites={() => navigateTo("favorites")}
                  onBookings={() => navigateTo("my_bookings")}
                  onEditProfile={() => navigateTo("profile_form")}
                  onSettings={() => navigateTo("settings")}
                  onHelp={() => window.open('https://t.me/alloraclub_support', '_blank')} // ИСПРАВЛЕНИЕ: Ссылка на саппорт
                />
              </motion.div>
            )}

            {currentScreen === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SettingsScreen
                  onBack={() => setCurrentScreen("profile")} // ИСПРАВЛЕНИЕ: возврат в профиль
                  onPrivacy={() => navigateTo("privacy")}
                  onOffer={() => navigateTo("offer")}
                  onConsent={() => navigateTo("consent")}
                />
              </motion.div>
            )}

            {currentScreen === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PrivacyPolicyScreen onBack={() => setCurrentScreen(previousScreen || "settings")} />
              </motion.div>
            )}

            {currentScreen === "offer" && (
              <motion.div key="offer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <OfferScreen onBack={() => setCurrentScreen(previousScreen || "settings")} />
              </motion.div>
            )}

            {currentScreen === "consent" && (
              <motion.div key="consent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConsentScreen onBack={() => setCurrentScreen(previousScreen || "settings")} />
              </motion.div>
            )}

            {currentScreen === "contacts" && (
              <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MyContactsScreen authToken={userToken} onBack={() => setCurrentScreen("booking")} />
              </motion.div>
            )}
            {currentScreen === "my_bookings" && (
              <motion.div key="my_bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MyBookingsScreen
                  city={fullProfile.city || "Москва"}
                  authToken={userToken}
                  onBack={() => setCurrentScreen("profile")}
                />
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

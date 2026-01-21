"use client";

import { useState, useEffect } from "react";
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
import { BookingFlow } from "@/components/BookingFlow";
import { ContactsScreen } from "@/components/ContactsScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { MyBookingsScreen } from "@/components/MyBookingsScreen";
import { EditProfileScreen } from "@/components/EditProfileScreen";
import { BottomNav } from "@/components/BottomNav";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getProfile, saveProfile, ApiError, type UserProfile } from "@/lib/api";

type Screen = "welcome" | "onboarding" | "quiz" | "age" | "gender" | "relationship" | "children" | "occupation" | "goal" | "interests" | "comfort" | "social_frequency" | "communication_format" | "evening_scenario" | "social_links" | "photo_upload" | "about_me" | "city" | "booking" | "contacts" | "profile" | "my_bookings" | "edit_profile";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userId, setUserId] = useState<number | undefined>(undefined);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userId || isSaving) return;

    setIsSaving(true);
    try {
      console.log('Saving profile data:', data);
      const res = await saveProfile(userId, data);
      console.log('✅ saveProfile response:', res);
    } catch (error) {
      console.error('❌ Failed to save profile', error);
      // Optionally, show an error to the user
    } finally {
      setIsSaving(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    const initUser = async () => {
      let userId: number | undefined;

      // 1. Try to get user ID from Telegram WebApp (when opened in Telegram)
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp) {
        webApp.expand();
        if (webApp?.initDataUnsafe?.user?.id) {
          userId = webApp.initDataUnsafe.user.id;
          console.log(`✅ User ID from Telegram: ${userId}`);
        }
      }

      // 2. Try to get user ID from URL query parameter
      if (!userId) {
        const params = new URLSearchParams(window.location.search);
        const queryUserId = params.get('userId');
        if (queryUserId) {
          userId = parseInt(queryUserId, 10);
          console.log(`✅ User ID from URL parameter: ${userId}`);
        }
      }

      // If no user ID found, keep loading - waiting for valid ID
      if (!userId) {
        console.warn('⏳ Waiting for user ID from Telegram or URL parameter...');
        return;
      }

      setUserId(userId);

      // Load existing profile and determine which screen to show
      try {
        const result = await getProfile(userId);
        const profile = (result as any)?.profile ?? (result as any);
        if (profile) {
          // Profile found - load all data
          console.log(`✅ Profile found for user ${userId}, loading data and going to booking`);
          setUserName(profile.name || "");
          setUserAge(profile.age || 25);
          setUserGender((profile.gender as "male" | "female") || null);
          setUserRelationship((profile.relationship_status as RelationshipStatus) || null);
          setUserChildren((profile.children as ChildrenStatus) || null);
          setUserOccupation((profile.occupation as OccupationType) || null);
          setUserGoal((profile.goal as GoalType) || null);
          setUserInterest((profile.interests as InterestType) || null);
          setUserComfort(profile.comfort_level || null);
          setUserSocialFrequency(profile.social_frequency || null);
          setUserCommunicationFormat((profile.communication_format as CommunicationFormat) || null);
          setUserEveningScenario((profile.evening_scenario as EveningScenario) || null);
          setUserSocialLinks({
            telegram: profile.telegram || "",
            instagram: profile.instagram || ""
          });
          setUserPhoto(profile.photo || null);
          setUserAboutMe(profile.about_me || "");
          setUserCity(profile.city || "");
          
          // Skip to booking screen for existing users
          setCurrentScreen("booking");
          setProfileLoaded(true);
        }
      } catch (error) {
        // Profile not found - user needs to fill questionnaire
        console.log(`📝 First time user - profile not found for ID: ${userId}, showing welcome screen`);
        setCurrentScreen("welcome");
        setProfileLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  const handleStartOnboarding = () => {
    setCurrentScreen("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen("quiz");
  };

  const handleQuizComplete = async (name: string) => {
    setUserName(name);
    await updateProfile({ name });
    setCurrentScreen("age");
  };

  const handleAgeComplete = async (age: number) => {
    setUserAge(age);
    await updateProfile({ age });
    setCurrentScreen("gender");
  };

  const handleGenderComplete = async (gender: "male" | "female") => {
    setUserGender(gender);
    await updateProfile({ gender });
    setCurrentScreen("relationship");
  };

  const handleRelationshipComplete = async (status: RelationshipStatus) => {
    setUserRelationship(status);
    await updateProfile({ relationship_status: status });
    setCurrentScreen("children");
  };

  const handleChildrenComplete = async (status: ChildrenStatus) => {
    setUserChildren(status);
    await updateProfile({ children: status });
    setCurrentScreen("occupation");
  };

  const handleOccupationComplete = async (occupation: OccupationType) => {
    setUserOccupation(occupation);
    await updateProfile({ occupation });
    setCurrentScreen("goal");
  };

  const handleGoalComplete = async (goal: GoalType) => {
    setUserGoal(goal);
    await updateProfile({ goal });
    setCurrentScreen("interests");
  };

  const handleInterestsComplete = async (interest: InterestType) => {
    setUserInterest(interest);
    await updateProfile({ interests: interest });
    setCurrentScreen("comfort");
  };

  const handleComfortComplete = async (level: number) => {
    setUserComfort(level);
    await updateProfile({ comfort_level: level });
    setCurrentScreen("social_frequency");
  };

  const handleSocialFrequencyComplete = async (level: number) => {
    setUserSocialFrequency(level);
    await updateProfile({ social_frequency: level });
    setCurrentScreen("communication_format");
  };

  const handleCommunicationFormatComplete = async (format: CommunicationFormat) => {
    setUserCommunicationFormat(format);
    await updateProfile({ communication_format: format });
    setCurrentScreen("evening_scenario");
  };

  const handleEveningScenarioComplete = async (scenario: EveningScenario) => {
    setUserEveningScenario(scenario);
    await updateProfile({ evening_scenario: scenario });
    setCurrentScreen("social_links");
  };

  const handleSocialLinksComplete = async (socials: { telegram: string; instagram: string }) => {
    setUserSocialLinks(socials);
    await updateProfile({ telegram: socials.telegram, instagram: socials.instagram });
    setCurrentScreen("photo_upload");
  };

  const handlePhotoUploadComplete = async (photo: string) => {
    setUserPhoto(photo);
    await updateProfile({ photo });
    setCurrentScreen("about_me");
  };

  const handleAboutMeComplete = async (about: string) => {
    setUserAboutMe(about);
    await updateProfile({ about_me: about });
    setCurrentScreen("city");
  };

  const handleCityComplete = async (city: string) => {
    setUserCity(city);
    await updateProfile({ city });
    setCurrentScreen("booking");
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

  const handleTabChange = (tab: "home" | "contacts" | "profile") => {
    if (tab === "home") setCurrentScreen("booking");
    else if (tab === "contacts") setCurrentScreen("contacts");
    else if (tab === "profile") setCurrentScreen("profile");
  };

  const handleSaveProfile = async (newData: any) => {
    if (!userId) return;
    
    const profileData = {
      name: newData.name || userName,
      age: newData.age || userAge,
      gender: newData.gender || userGender,
      relationship_status: newData.relationship || userRelationship,
      children: newData.children || userChildren,
      occupation: newData.occupation || userOccupation,
      goal: newData.goal || userGoal,
      interests: newData.interest || userInterest,
      comfort_level: newData.comfort || userComfort,
      social_frequency: newData.socialFrequency || userSocialFrequency,
      communication_format: newData.communicationFormat || userCommunicationFormat,
      evening_scenario: newData.eveningScenario || userEveningScenario,
      telegram: newData.socialLinks?.telegram || userSocialLinks.telegram,
      instagram: newData.socialLinks?.instagram || userSocialLinks.instagram,
      photo: newData.photo || userPhoto,
      about_me: newData.aboutMe || userAboutMe,
      city: newData.city || userCity,
    };
    
    const success = await saveProfile(userId, profileData);
    if (success) {
      // Update local state
      setUserName(profileData.name);
      setUserAboutMe(profileData.about_me);
      setUserSocialLinks({
        telegram: profileData.telegram,
        instagram: profileData.instagram
      });
      setCurrentScreen("profile");
    }
  };

  const handleSelectField = (field: string) => {
    // Mapping edit fields to onboarding screens
    const fieldToScreen: Record<string, Screen> = {
      age: "age",
      gender: "gender",
      relationship: "relationship",
      children: "children",
      occupation: "occupation",
      interest: "interests",
      communicationFormat: "communication_format",
      eveningScenario: "evening_scenario",
      comfort: "comfort",
      socialFrequency: "social_frequency"
    };
    
    const targetScreen = fieldToScreen[field];
    if (targetScreen) {
      setCurrentScreen(targetScreen);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentScreen === "onboarding" ? "#000000" : "#E9E9E9" }}>
      <AnimatePresence mode="wait">
        {isLoading && !profileLoaded && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingScreen message="Проверка профиля..." />
          </motion.div>
        )}

        {profileLoaded && currentScreen === "welcome" && (
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

        {profileLoaded && currentScreen === "onboarding" && (
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

        {profileLoaded && currentScreen === "quiz" && (
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

        {profileLoaded && currentScreen === "age" && (
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

        {profileLoaded && currentScreen === "gender" && (
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

        {profileLoaded && currentScreen === "relationship" && (
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

        {profileLoaded && currentScreen === "children" && (
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

        {profileLoaded && currentScreen === "occupation" && (
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

        {profileLoaded && currentScreen === "goal" && (
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

        {profileLoaded && currentScreen === "interests" && (
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

        {profileLoaded && currentScreen === "comfort" && (
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

        {profileLoaded && currentScreen === "social_frequency" && (
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

        {profileLoaded && currentScreen === "communication_format" && (
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

        {profileLoaded && currentScreen === "evening_scenario" && (
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

        {profileLoaded && currentScreen === "social_links" && (
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

        {profileLoaded && currentScreen === "photo_upload" && (
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

        {profileLoaded && currentScreen === "about_me" && (
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

        {profileLoaded && currentScreen === "city" && (
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
              onBack={() => setCurrentScreen("about_me")}
              progress={100}
            />
          </motion.div>
        )}

        {profileLoaded && currentScreen === "booking" && (
          <motion.div
            key="booking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <BookingFlow 
              city={userCity}
              userId={userId}
              onBack={() => setCurrentScreen("city")}
              onTabChange={handleTabChange}
            />
          </motion.div>
        )}

        {profileLoaded && currentScreen === "contacts" && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <ContactsScreen 
              city={userCity} 
              onTabChange={handleTabChange}
            />
          </motion.div>
        )}

        {profileLoaded && currentScreen === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <ProfileScreen 
              userName={userName}
              userPhoto={userPhoto}
              city={userCity}
              onEditProfile={() => setCurrentScreen("edit_profile")}
              onMyBookings={() => setCurrentScreen("my_bookings")}
              onTabChange={handleTabChange}
            />
          </motion.div>
        )}

        {profileLoaded && currentScreen === "my_bookings" && (
          <motion.div
            key="my_bookings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <MyBookingsScreen 
              city={userCity}
              userId={userId}
              onBack={() => setCurrentScreen("profile")}
              onTabChange={handleTabChange}
            />
          </motion.div>
        )}

        {profileLoaded && currentScreen === "edit_profile" && (
          <motion.div
            key="edit_profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <EditProfileScreen 
              userData={{
                name: userName,
                age: userAge,
                gender: userGender,
                relationship: userRelationship,
                children: userChildren,
                occupation: userOccupation,
                goal: userGoal,
                interest: userInterest,
                comfort: userComfort,
                socialFrequency: userSocialFrequency,
                communicationFormat: userCommunicationFormat,
                eveningScenario: userEveningScenario,
                socialLinks: userSocialLinks,
                photo: userPhoto,
                aboutMe: userAboutMe,
                city: userCity,
              }}
              onSave={handleSaveProfile}
              onBack={() => setCurrentScreen("profile")}
              onSelectField={handleSelectField}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}






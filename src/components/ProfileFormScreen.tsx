"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import { ru } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getProfile } from "@/lib/api";
interface ProfileFormData {
  name: string;
  gender: string;
  age: number;
  zodiac: string;
  career: string;
  familyStatus: string;
  hasChildren: string;
}

type FieldKey = 'gender' | 'zodiac' | 'career' | 'familyStatus' | 'hasChildren';

interface ProfileFormScreenProps {
  onContinue: (data: ProfileFormData) => void;
  onBack: (data: ProfileFormData) => void;
  initialData?: Partial<ProfileFormData>;
  userId?: number;
  userToken?: string | null;
}

export function ProfileFormScreen({ onContinue, onBack, initialData, userId, userToken }: ProfileFormScreenProps) {
  const texts = ru.profileForm;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || "",
    gender: initialData?.gender || "",
    age: typeof initialData?.age === "number" ? initialData.age : 25,
    zodiac: initialData?.zodiac || "",
    career: initialData?.career || "",
    familyStatus: initialData?.familyStatus || "",
    hasChildren: initialData?.hasChildren || "",
  });

  const [openDropdown, setOpenDropdown] = useState<FieldKey | null>(null);

  // Загрузить профиль из БД при открытии экрана
  useEffect(() => {
    const loadProfileFromDB = async () => {
      if (!userId || !userToken) return;
      
      try {
        setIsLoading(true);
        console.log(`📥 Loading profile from DB for user ${userId}`);
        const response = await getProfile(userId, userToken);
        
        if (response.profile) {
          console.log('✅ Profile loaded from DB:', response.profile);
          setFormData((prev) => ({
            ...prev,
            name: response.profile.name || prev.name,
            gender: response.profile.gender === "male" ? "Мужской" : response.profile.gender === "female" ? "Женский" : prev.gender,
            age: response.profile.age || prev.age,
            zodiac: response.profile.zodiac || prev.zodiac,
            career: response.profile.occupation || prev.career,
            familyStatus: response.profile.relationship_status || prev.familyStatus,
            hasChildren: response.profile.children || prev.hasChildren,
          }));
        }
      } catch (error) {
        console.error('❌ Failed to load profile from DB:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfileFromDB();
  }, [userId, userToken]);

  // Пересинхронизировать состояние когда initialData меняется
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || prev.name,
        gender: initialData.gender || prev.gender,
        age: typeof initialData.age === "number" ? initialData.age : prev.age,
        zodiac: initialData.zodiac || prev.zodiac,
        career: initialData.career || prev.career,
        familyStatus: initialData.familyStatus || prev.familyStatus,
        hasChildren: initialData.hasChildren || prev.hasChildren,
      }));
    }
  }, [initialData]);

  const isFormComplete = formData.name.trim() !== "" && 
                         formData.gender !== "" && 
                         formData.age >= 18 &&
                         formData.zodiac !== "" && 
                         formData.career !== "" && 
                         formData.familyStatus !== "" && 
                         formData.hasChildren !== "";

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const dropdownFields: { key: FieldKey; options: string[] }[] = [
    { key: "gender", options: texts.fields.gender.options },
    { key: "zodiac", options: texts.fields.zodiac.options },
    { key: "career", options: texts.fields.career.options },
    { key: "familyStatus", options: texts.fields.familyStatus.options },
    { key: "hasChildren", options: texts.fields.hasChildren.options },
  ];

  const handleDropdownToggle = (field: FieldKey) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const handleOptionSelect = (field: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  };

  const getPlaceholder = (key: FieldKey): string => {
    const fieldTexts = texts.fields[key];
    return "placeholder" in fieldTexts ? fieldTexts.placeholder : "";
  };

  // Age Wheel Picker Logic
  const itemHeight = 60;
  const ages = Array.from({ length: 82 }, (_, i) => 18 + i);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      // Snap to nearest item
      if (scrollContainerRef.current) {
        const scroll = scrollContainerRef.current.scrollTop;
        const itemIndex = Math.round(scroll / itemHeight);
        const nearestScroll = itemIndex * itemHeight;
        
        scrollContainerRef.current.scrollTo({
          top: nearestScroll,
          behavior: "smooth",
        });

        const selectedAge = ages[itemIndex];
        if (selectedAge) {
          setFormData((prev) => ({ ...prev, age: selectedAge }));
        }
      }
    }, 150);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const initialIndex = ages.indexOf(formData.age);
      if (initialIndex >= 0) {
        // Center the selected age (item should be at middle position)
        scrollContainerRef.current.scrollTop = (initialIndex - 1) * itemHeight;
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="h-[6px] bg-[#D9D9D9] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2A2021] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "25%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[#E15859] text-[32px] font-black text-center mt-6 mb-4 uppercase"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {texts.title}
      </motion.h1>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="flex flex-col gap-3">
          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={texts.fields.name.placeholder}
              className="w-full bg-white rounded-full px-6 py-4 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
          </motion.div>

          {/* Age Wheel Picker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-[24px] px-6 py-4"
          >
            <div className="flex flex-col gap-4">
              <label
                className="text-[16px] text-[#2A2021] font-medium"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {texts.fields.age.placeholder}
              </label>

              {/* Wheel Picker Container */}
              <div className="relative flex flex-col items-center">
                {/* Scrollable Numbers */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="h-[180px] overflow-y-scroll scroll-smooth"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollSnapType: "y mandatory",
                  }}
                >
                  {/* Spacer Top */}
                  <div style={{ height: itemHeight }} />

                  {/* Age Items */}
                  {ages.map((age, index) => {
                    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
                    // Правильный расчет центра элемента (с учетом спейсера вверху)
                    const itemCenter = (index + 1) * itemHeight + itemHeight / 2;
                    const viewportCenter = scrollTop + 90; // 90 = half of 180px container
                    const distance = Math.abs(itemCenter - viewportCenter);
                    const isCenter = distance < itemHeight * 0.4;

                    return (
                      <div
                        key={age}
                        style={{ height: itemHeight }}
                        className="flex items-center justify-center scroll-snap-align-center"
                      >
                        <motion.div
                          animate={{
                            backgroundColor: isCenter ? "#E15859" : "transparent",
                            paddingLeft: isCenter ? "12px" : "0px",
                            paddingRight: isCenter ? "12px" : "0px",
                          }}
                          transition={{ duration: 0.15 }}
                          className={cn(
                            "flex items-center justify-center rounded-full transition-all",
                            isCenter ? "py-2" : ""
                          )}
                        >
                          <motion.span
                            animate={{
                              fontSize: isCenter ? "22px" : "18px",
                              color: isCenter ? "#FFFFFF" : "#2A2021",
                              fontWeight: isCenter ? "900" : "600",
                            }}
                            transition={{ duration: 0.15 }}
                            className="text-center"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {age}
                          </motion.span>
                        </motion.div>
                      </div>
                    );
                  })}

                  {/* Spacer Bottom */}
                  <div style={{ height: itemHeight }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dropdown Fields */}
          {dropdownFields.map(({ key, options }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (index + 3) }}
            >
              <div
                className={`bg-white overflow-hidden transition-all duration-300 ${
                  openDropdown === key ? "rounded-[24px]" : "rounded-full"
                }`}
              >
                {/* Dropdown Header */}
                <button
                  onClick={() => handleDropdownToggle(key)}
                  className="w-full flex items-center justify-between px-6 py-4"
                >
                  <span
                    className={`text-[16px] ${
                      formData[key] ? "text-[#2A2021] font-medium" : "text-[#9CA3AF]"
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {formData[key] || getPlaceholder(key)}
                  </span>
                  <div
                    className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-colors ${
                      openDropdown === key ? "bg-[#E15859]" : "bg-[#E15859]"
                    }`}
                  >
                    {openDropdown === key ? (
                      <ChevronUp className="w-6 h-6 text-white" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {openDropdown === key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4">
                        {options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleOptionSelect(key, option)}
                            className="w-full flex items-center justify-between py-3"
                          >
                            <span
                              className={`text-[16px] ${
                                formData[key] === option
                                  ? "text-[#2A2021] font-medium"
                                  : "text-[#9CA3AF]"
                              }`}
                              style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                              {option}
                            </span>
                            <div
                              className={`w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center ${
                                formData[key] === option
                                  ? "border-[#E15859]"
                                  : "border-[#E15859]"
                              }`}
                            >
                              {formData[key] === option && (
                                <div className="w-[14px] h-[14px] rounded-full bg-[#E15859]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="px-6 pb-8 pt-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBack(formData)}
            className="w-[56px] h-[56px] rounded-full border-2 border-[#E15859] flex items-center justify-center bg-transparent"
          >
            <ChevronLeft className="w-6 h-6 text-[#E15859]" />
          </motion.button>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: isFormComplete ? 0.98 : 1 }}
            onClick={() => isFormComplete && onContinue(formData)}
            disabled={!isFormComplete}
            className={`flex-1 py-[18px] rounded-full text-[18px] font-medium transition-all ${
              isFormComplete
                ? "bg-[#E15859] text-white"
                : "bg-[#E15859]/30 text-white/50"
            }`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {texts.continueButton}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

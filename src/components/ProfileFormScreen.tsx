"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import { ru } from "@/lib/i18n";

interface ProfileFormData {
  name: string;
  gender: string;
  age: string;
  zodiac: string;
  career: string;
  familyStatus: string;
  hasChildren: string;
}

interface ProfileFormScreenProps {
  onContinue: (data: ProfileFormData) => void;
  onBack: () => void;
  initialData?: Partial<ProfileFormData>;
}

type FieldKey = keyof Omit<ProfileFormData, "name">;

export function ProfileFormScreen({ onContinue, onBack, initialData }: ProfileFormScreenProps) {
  const texts = ru.profileForm;
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || "",
    gender: initialData?.gender || "",
    age: initialData?.age || "",
    zodiac: initialData?.zodiac || "",
    career: initialData?.career || "",
    familyStatus: initialData?.familyStatus || "",
    hasChildren: initialData?.hasChildren || "",
  });

  const [openDropdown, setOpenDropdown] = useState<FieldKey | null>(null);

  const isFormComplete = Object.values(formData).every((value) => value.trim() !== "");

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownToggle = (field: FieldKey) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const handleOptionSelect = (field: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  };

  const dropdownFields: { key: FieldKey; options: string[] }[] = [
    { key: "gender", options: texts.fields.gender.options },
    { key: "age", options: texts.fields.age.options },
    { key: "zodiac", options: texts.fields.zodiac.options },
    { key: "career", options: texts.fields.career.options },
    { key: "familyStatus", options: texts.fields.familyStatus.options },
    { key: "hasChildren", options: texts.fields.hasChildren.options },
  ];

  const getPlaceholder = (key: FieldKey): string => {
    const fieldTexts = texts.fields[key];
    return "placeholder" in fieldTexts ? fieldTexts.placeholder : "";
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: "#E9E9E9", touchAction: "pan-y" }}
    >
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

          {/* Dropdown Fields */}
          {dropdownFields.map(({ key, options }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * (index + 2) }}
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
            onClick={onBack}
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

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            username?: string;
          };
        };
      };
    };
  }
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronLeft, Send, Camera, Image as ImageIcon } from "lucide-react";
import { ru } from "@/lib/i18n";

interface BestInMeFormData {
  strengths: string[];
  weaknesses: string;
  values: string[];
  loveLanguage: string[];
  goals: string;
  dreams: string;
  interests: string[];
  telegramNickname: string;
  instagramNickname: string;
  photo: string | null;
}

interface BestInMeScreenProps {
  onContinue: (data: BestInMeFormData) => void;
  onBack: () => void;
  initialData?: Partial<BestInMeFormData>;
}

type MultiSelectField = "strengths" | "values" | "loveLanguage" | "interests";
type DropdownField = MultiSelectField;

export function BestInMeScreen({ onContinue, onBack, initialData }: BestInMeScreenProps) {
  const texts = ru.bestInMe;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BestInMeFormData>({
    strengths: initialData?.strengths || [],
    weaknesses: initialData?.weaknesses || "",
    values: initialData?.values || [],
    loveLanguage: initialData?.loveLanguage || [],
    goals: initialData?.goals || "",
    dreams: initialData?.dreams || "",
    interests: initialData?.interests || [],
    telegramNickname: initialData?.telegramNickname || "",
    instagramNickname: initialData?.instagramNickname || "",
    photo: initialData?.photo || null,
  });

  const [openDropdown, setOpenDropdown] = useState<DropdownField | null>(null);

  // Автозаполнение telegram никнейма из Telegram WebApp API
  useEffect(() => {
    if (!initialData?.telegramNickname) {
      const telegramUsername =
        typeof window !== "undefined"
          ? window.Telegram?.WebApp?.initDataUnsafe?.user?.username || ""
          : "";

      if (telegramUsername) {
        setFormData((prev) => ({
          ...prev,
          telegramNickname: telegramUsername,
        }));
      }
    }
  }, [initialData?.telegramNickname]);

  // Обязательные поля: strengths, values, loveLanguage, interests, telegramNickname
  const isFormComplete = 
    formData.strengths.length > 0 &&
    formData.values.length > 0 &&
    formData.loveLanguage.length > 0 &&
    formData.interests.length > 0 &&
    formData.telegramNickname.trim() !== "";

  const handleTextChange = (field: "weaknesses" | "goals" | "dreams" | "telegramNickname" | "instagramNickname", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownToggle = (field: DropdownField) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const handleMultiSelect = (field: MultiSelectField, value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const dropdownFields: { key: MultiSelectField; options: string[] }[] = [
    { key: "strengths", options: texts.fields.strengths.options },
    { key: "values", options: texts.fields.values.options },
    { key: "loveLanguage", options: texts.fields.loveLanguage.options },
    { key: "interests", options: texts.fields.interests.options },
  ];

  const getFieldPlaceholder = (key: string): string => {
    const field = texts.fields[key as keyof typeof texts.fields];
    return field && "placeholder" in field ? field.placeholder : "";
  };

  const getFieldOptionalLabel = (key: string): string | undefined => {
    const field = texts.fields[key as keyof typeof texts.fields];
    return field && "optional" in field ? field.optional : undefined;
  };

  const getSelectedDisplay = (field: MultiSelectField): string => {
    const selected = formData[field];
    if (selected.length === 0) return getFieldPlaceholder(field);
    if (selected.length === 1) return selected[0];
    return `${selected[0]} +${selected.length - 1}`;
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
            className="h-full bg-[#E15859] rounded-full"
            initial={{ width: "25%" }}
            animate={{ width: "50%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[#E15859] text-[28px] font-black text-center mt-6 mb-4 uppercase"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {texts.title}
      </motion.h1>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="flex flex-col gap-3">
          
          {/* Моя сила - Multi-select dropdown */}
          <DropdownMultiSelect
            field="strengths"
            formData={formData}
            openDropdown={openDropdown}
            onToggle={handleDropdownToggle}
            onSelect={handleMultiSelect}
            options={texts.fields.strengths.options}
            placeholder={getFieldPlaceholder("strengths")}
            selectedDisplay={getSelectedDisplay("strengths")}
          />

          {/* Мои слабости - Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <textarea
              value={formData.weaknesses}
              onChange={(e) => handleTextChange("weaknesses", e.target.value)}
              placeholder={texts.fields.weaknesses.hint}
              className="w-full bg-white rounded-[24px] px-6 py-4 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none resize-none"
              rows={3}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
            <span className="text-[12px] text-[#9CA3AF] mt-1 block px-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              ({texts.fields.weaknesses.placeholder})
            </span>
          </motion.div>

          {/* Жизненные ценности - Multi-select dropdown */}
          <DropdownMultiSelect
            field="values"
            formData={formData}
            openDropdown={openDropdown}
            onToggle={handleDropdownToggle}
            onSelect={handleMultiSelect}
            options={texts.fields.values.options}
            placeholder={getFieldPlaceholder("values")}
            selectedDisplay={getSelectedDisplay("values")}
            delay={0.2}
          />

          {/* Язык любви - Multi-select dropdown */}
          <DropdownMultiSelect
            field="loveLanguage"
            formData={formData}
            openDropdown={openDropdown}
            onToggle={handleDropdownToggle}
            onSelect={handleMultiSelect}
            options={texts.fields.loveLanguage.options}
            placeholder={getFieldPlaceholder("loveLanguage")}
            selectedDisplay={getSelectedDisplay("loveLanguage")}
            delay={0.25}
          />

          {/* Мои цели - Text input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <input
              type="text"
              value={formData.goals}
              onChange={(e) => handleTextChange("goals", e.target.value)}
              placeholder={texts.fields.goals.placeholder}
              className="w-full bg-white rounded-full px-6 py-4 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
          </motion.div>

          {/* Мои мечты - Text input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <input
              type="text"
              value={formData.dreams}
              onChange={(e) => handleTextChange("dreams", e.target.value)}
              placeholder={texts.fields.dreams.placeholder}
              className="w-full bg-white rounded-full px-6 py-4 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
          </motion.div>

          {/* Мои интересы - Multi-select dropdown */}
          <DropdownMultiSelect
            field="interests"
            formData={formData}
            openDropdown={openDropdown}
            onToggle={handleDropdownToggle}
            onSelect={handleMultiSelect}
            options={texts.fields.interests.options}
            placeholder={getFieldPlaceholder("interests")}
            selectedDisplay={getSelectedDisplay("interests")}
            delay={0.4}
          />

          {/* Separator */}
          <div className="flex justify-center my-2">
            <div className="w-[100px] h-[4px] bg-[#2A2021] rounded-full" />
          </div>

          {/* Telegram nickname */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <div className="bg-white rounded-full px-6 py-3 flex items-center gap-3">
              <input
                type="text"
                value={formData.telegramNickname}
                onChange={(e) => handleTextChange("telegramNickname", e.target.value)}
                placeholder={texts.fields.telegramNickname.placeholder}
                className="flex-1 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              />
              <div className="w-[44px] h-[44px] bg-[#E15859] rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Instagram nickname */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="bg-white rounded-full px-6 py-3 flex items-center gap-3">
              <input
                type="text"
                value={formData.instagramNickname}
                onChange={(e) => handleTextChange("instagramNickname", e.target.value)}
                placeholder={texts.fields.instagramNickname.placeholder}
                className="flex-1 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              />
              <span className="text-[12px] text-[#9CA3AF] mr-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                ({texts.fields.instagramNickname.optional})
              </span>
              <div className="w-[44px] h-[44px] bg-[#E15859] rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Photo upload */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
            className="flex flex-col items-center mt-4 mb-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div 
              onClick={handlePhotoClick}
              className="w-[140px] h-[140px] rounded-full bg-[#E15859] flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-16 h-16 text-white" />
              )}
            </div>
            <button
              onClick={handlePhotoClick}
              className="mt-4 px-8 py-3 rounded-full border-2 border-[#E15859] text-[#E15859] text-[16px] font-medium"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {formData.photo ? texts.replacePhotoButton : texts.addPhotoButton}
            </button>
          </motion.div>

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

// Компонент для выпадающего списка с мультивыбором (чекбоксы)
function DropdownMultiSelect({
  field,
  formData,
  openDropdown,
  onToggle,
  onSelect,
  options,
  placeholder,
  selectedDisplay,
  delay = 0.1,
}: {
  field: MultiSelectField;
  formData: BestInMeFormData;
  openDropdown: DropdownField | null;
  onToggle: (field: DropdownField) => void;
  onSelect: (field: MultiSelectField, value: string) => void;
  options: string[];
  placeholder: string;
  selectedDisplay: string;
  delay?: number;
}) {
  const isOpen = openDropdown === field;
  const hasSelection = formData[field].length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div
        className={`bg-white overflow-hidden transition-all duration-300 ${
          isOpen ? "rounded-[24px]" : "rounded-full"
        }`}
      >
        {/* Dropdown Header */}
        <button
          onClick={() => onToggle(field)}
          className="w-full flex items-center justify-between px-6 py-4"
        >
          <span
            className={`text-[16px] ${
              hasSelection ? "text-[#2A2021] font-medium" : "text-[#9CA3AF]"
            }`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {selectedDisplay}
          </span>
          <div
            className="w-[44px] h-[44px] rounded-full flex items-center justify-center bg-[#E15859]"
          >
            {isOpen ? (
              <ChevronUp className="w-6 h-6 text-white" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white" />
            )}
          </div>
        </button>

        {/* Dropdown Options with Checkboxes */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-4 max-h-[200px] overflow-y-auto">
                {options.map((option) => {
                  const isSelected = formData[field].includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => onSelect(field, option)}
                      className="w-full flex items-center justify-between py-3"
                    >
                      <span
                        className={`text-[16px] ${
                          isSelected
                            ? "text-[#2A2021] font-medium"
                            : "text-[#9CA3AF]"
                        }`}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {option}
                      </span>
                      <div
                        className={`w-[28px] h-[28px] rounded-[6px] border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-[#E15859] bg-[#E15859]"
                            : "border-[#E15859]"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

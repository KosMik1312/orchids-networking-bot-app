"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { ru } from "@/lib/i18n";

interface MeetingConditionsData {
  place: string[];
  payment: string | null;
  budget: string;
  expectations: string;
}

interface MeetingConditionsScreenProps {
  onContinue: (data: MeetingConditionsData) => void;
  onBack: () => void;
  initialData?: Partial<MeetingConditionsData>;
}

export function MeetingConditionsScreen({ onContinue, onBack, initialData }: MeetingConditionsScreenProps) {
  const texts = ru.meetingConditions;

  const [formData, setFormData] = useState<MeetingConditionsData>({
    place: initialData?.place || [],
    payment: initialData?.payment || null,
    budget: initialData?.budget || "",
    expectations: initialData?.expectations || "",
  });

  const handleMultiSelect = (field: "place", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSingleSelect = (field: "payment", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: "budget" | "expectations", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  // place and payment are required
  const isFormComplete = formData.place.length > 0 && formData.payment !== null;

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
            initial={{ width: "50%" }}
            animate={{ width: "75%" }} // Progress after screen 4
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
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

        {/* Place for meeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <h2 className="text-[16px] text-gray-500 font-medium mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{texts.fields.place.title}</h2>
            <div className="flex flex-wrap gap-2">
                {texts.fields.place.options.map(option => {
                    const isSelected = formData.place.includes(option);
                    return (
                        <button
                            key={option}
                            onClick={() => handleMultiSelect("place", option)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                isSelected ? 'bg-[#E15859] text-white' : 'bg-white text-gray-700'
                            }`}
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            {option}
                            {isSelected && <Check className="w-4 h-4" />}
                        </button>
                    )
                })}
            </div>
        </motion.div>

        {/* Who pays */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <h2 className="text-[16px] text-gray-500 font-medium mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{texts.fields.payment.title}</h2>
            <div className="grid grid-cols-2 gap-3">
                {texts.fields.payment.options.map(option => {
                    const isSelected = formData.payment === option;
                    return (
                        <button
                            key={option}
                            onClick={() => handleSingleSelect("payment", option)}
                            className={`py-3 px-4 rounded-[16px] text-center font-medium transition-all ${
                                isSelected ? 'bg-[#E15859] text-white' : 'bg-white text-gray-700'
                            }`}
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                           {option}
                        </button>
                    )
                })}
            </div>
        </motion.div>
        
        {/* Budget */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
             <h2 className="text-[16px] text-gray-500 font-medium mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>{texts.fields.budget.title}</h2>
             <input
                type="text"
                value={formData.budget}
                onChange={(e) => handleTextChange("budget", e.target.value)}
                placeholder={texts.fields.budget.placeholder}
                className="w-full bg-white rounded-full px-6 py-4 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
            <p className="text-xs text-gray-400 text-center mt-1">{texts.fields.budget.hint}</p>
        </motion.div>

        {/* Expectations */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
            <div className="flex items-center gap-2 mb-2">
                 <h2 className="text-[16px] text-gray-500 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>{texts.fields.expectations.title}</h2>
                 <span className="text-xs text-gray-400">({texts.fields.expectations.optional})</span>
            </div>
             <textarea
                value={formData.expectations}
                onChange={(e) => handleTextChange("expectations", e.target.value)}
                placeholder={texts.fields.expectations.placeholder}
                className="w-full bg-white rounded-[24px] px-6 py-4 text-[16px] text-[#2A2021] placeholder-[#9CA3AF] outline-none min-h-[100px]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
        </motion.div>

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

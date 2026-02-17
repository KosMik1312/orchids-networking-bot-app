// "use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { ru } from "@/lib/i18n";

interface MeetingConditionsData {
  metro: string[];
  days: string[];
  time: { from: string; to: string };
  goal: string;
  format: string;
}

interface MeetingConditionsScreenProps {
  onContinue: (data: MeetingConditionsData) => void;
  onBack: (data: MeetingConditionsData) => void;
  initialData?: Partial<MeetingConditionsData>;
}

export function MeetingConditionsScreen({ onContinue, onBack, initialData }: MeetingConditionsScreenProps) {
  const texts = ru.meetingConditions;

  const [formData, setFormData] = useState<MeetingConditionsData>({
    metro: initialData?.metro || [],
    days: initialData?.days || [],
    time: initialData?.time || { from: "17:00", to: "21:00" },
    goal: initialData?.goal || "",
    format: initialData?.format || "",
  });

  const [openSection, setOpenSection] = useState<string | null>(null);

  // Пересинхронизировать состояние когда initialData меняется (при возврате на этот экран)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const updated = { ...prev };
        
        if (initialData.metro && initialData.metro.length > 0) {
          updated.metro = initialData.metro;
        }
        if (initialData.days && initialData.days.length > 0) {
          updated.days = initialData.days;
        }
        if (initialData.time) {
          updated.time = initialData.time;
        }
        if (initialData.goal) {
          updated.goal = initialData.goal;
        }
        if (initialData.format) {
          updated.format = initialData.format;
        }
        
        return updated;
      });
    }
  }, [initialData]);

  const toggleSection = useCallback((section: string) => {
    setOpenSection(currentOpen => currentOpen === section ? null : section);
  }, []);

  const handleMultiSelect = useCallback((field: "metro" | "days", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  }, []);

  const handleSingleSelect = useCallback((field: "goal" | "format", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTimeChange = useCallback((field: "from" | "to", value: string) => {
    setFormData((prev) => ({ ...prev, time: { ...prev.time, [field]: value } }));
  }, []);

  const isFormComplete = 
    formData.metro.length > 0 && 
    formData.days.length > 0 && 
    formData.goal !== "" && 
    formData.format !== "";

  const AccordionItem = ({ 
    id, 
    label, 
    children, 
    isOpen 
  }: { 
    id: string; 
    label: string; 
    children: React.ReactNode; 
    isOpen: boolean 
  }) => (
    <div className="bg-white rounded-[32px] overflow-hidden mb-4 shadow-sm">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <span className="text-[18px] text-[#9CA3AF] font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-[#E15859] rotate-180' : 'bg-[#E15859]'}`}>
          <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </button>
      <motion.div
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        initial={false}
        transition={{ duration: 0.2 }}
        style={{ overflow: "hidden" }}
      >
        <div className="px-6 pb-6 pt-2 space-y-3 max-h-[250px] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      {/* Progress Bar */}
      <div className="px-8 pt-6">
        <div className="h-[6px] bg-[#D9D9D9] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2A2021] rounded-full"
            initial={{ width: "60%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="px-8 mt-10 mb-8">
        <h1 className="text-[#E15859] text-[32px] font-black text-center leading-tight uppercase whitespace-pre-line">
          {texts.title}
        </h1>
      </div>

      {/* Form Sections */}
      <div className="flex-1 px-6 overflow-y-auto">
        {/* Metro */}
        <AccordionItem id="metro" label={texts.metro.label} isOpen={openSection === "metro"}>
          {texts.metro.options.map((option) => (
            <div 
              key={option} 
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              onClick={() => handleMultiSelect("metro", option)}
            >
              <span className="text-[18px] text-[#9CA3AF]">{option}</span>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                formData.metro.includes(option) ? 'bg-[#E15859] border-[#E15859]' : 'border-[#E15859]'
              }`}>
                {formData.metro.includes(option) && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </AccordionItem>

        {/* Days */}
        <AccordionItem id="days" label={texts.days.label} isOpen={openSection === "days"}>
          {texts.days.options.map((option) => (
            <div 
              key={option} 
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              onClick={() => handleMultiSelect("days", option)}
            >
              <span className="text-[18px] text-[#9CA3AF]">{option}</span>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                formData.days.includes(option) ? 'bg-[#E15859] border-[#E15859]' : 'border-[#E15859]'
              }`}>
                {formData.days.includes(option) && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </AccordionItem>

        {/* Time */}
        <AccordionItem id="time" label={texts.time.label} isOpen={openSection === "time"}>
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[18px] text-[#9CA3AF]">{texts.time.from}</span>
              <input 
                type="text" 
                value={formData.time.from}
                onChange={(e) => handleTimeChange("from", e.target.value)}
                className="w-full border-2 border-[#E15859] rounded-full px-4 py-2 text-center text-[#E15859] font-medium outline-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[18px] text-[#9CA3AF]">{texts.time.to}</span>
              <input 
                type="text" 
                value={formData.time.to}
                onChange={(e) => handleTimeChange("to", e.target.value)}
                className="w-full border-2 border-[#E15859] rounded-full px-4 py-2 text-center text-[#E15859] font-medium outline-none"
              />
            </div>
          </div>
        </AccordionItem>

        {/* Goals */}
        <AccordionItem id="goals" label={texts.goals.label} isOpen={openSection === "goals"}>
          {texts.goals.options.map((option) => (
            <div 
              key={option} 
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              onClick={() => handleSingleSelect("goal", option)}
            >
              <span className="text-[18px] text-[#9CA3AF]">{option}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                formData.goal === option ? 'bg-[#E15859] border-[#E15859]' : 'border-[#E15859]'
              }`}>
                {formData.goal === option && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </AccordionItem>

        {/* Format */}
        <AccordionItem id="format" label={texts.format.label} isOpen={openSection === "format"}>
          {texts.format.options.map((option) => (
            <div 
              key={option} 
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              onClick={() => handleSingleSelect("format", option)}
            >
              <span className="text-[18px] text-[#9CA3AF]">{option}</span>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  formData.format === option ? 'bg-[#E15859] border-[#E15859]' : 'border-[#E15859]'
                }`}>
                {formData.format === option && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </AccordionItem>
      </div>

      {/* Bottom Buttons */}
      <div className="px-6 pb-10 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onBack(formData)}
            className="w-[70px] h-[70px] rounded-full border-2 border-[#E15859] flex items-center justify-center bg-transparent shrink-0"
          >
            <ChevronLeft className="w-8 h-8 text-[#E15859]" />
          </button>

          <button
            onClick={() => {
              if (isFormComplete) {
                onContinue(formData);
              }
            }}
            disabled={!isFormComplete}
            className={`flex-1 h-[70px] rounded-full text-[20px] font-medium transition-all ${
              isFormComplete ? "bg-[#E15859] text-white cursor-pointer" : "bg-[#BDBDBD] text-white/50 cursor-not-allowed"
            }`}
          >
            {texts.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

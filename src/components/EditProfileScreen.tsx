"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Settings, 
  ChevronRight,
  Send,
  Instagram,
  Camera
} from "lucide-react";
import { RelationshipStatus } from "./RelationshipStatusScreen";
import { ChildrenStatus } from "./ChildrenStatusScreen";
import { OccupationType } from "./OccupationSelectionScreen";
import { GoalType } from "./GoalSelectionScreen";
import { InterestType } from "./InterestsSelectionScreen";
import { CommunicationFormat } from "./CommunicationFormatScreen";
import { EveningScenario } from "./EveningScenarioScreen";

interface EditProfileScreenProps {
  userData: {
    name: string;
    age: number;
    gender: "male" | "female" | null;
    relationship: RelationshipStatus | null;
    children: ChildrenStatus | null;
    occupation: OccupationType | null;
    goal: GoalType | null;
    interest: InterestType | null;
    comfort: number | null;
    socialFrequency: number | null;
    communicationFormat: CommunicationFormat | null;
    eveningScenario: EveningScenario | null;
    socialLinks: { telegram: string; instagram: string };
    photo: string | null;
    aboutMe: string;
    city: string;
  };
  onSave: (newData: any) => void;
  onBack: () => void;
  onSelectField: (field: string) => void;
}

export function EditProfileScreen({ userData, onSave, onBack, onSelectField }: EditProfileScreenProps) {
  const [aboutMe, setAboutMe] = useState(userData.aboutMe);
  const [telegram, setTelegram] = useState(userData.socialLinks.telegram);
  const [instagram, setInstagram] = useState(userData.socialLinks.instagram);

  const handleSave = () => {
    onSave({
      ...userData,
      aboutMe,
      socialLinks: { telegram, instagram }
    });
  };

  const renderField = (label: string, value: string | number | null, fieldKey: string) => (
    <button
      onClick={() => onSelectField(fieldKey)}
      className="w-full flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
    >
      <div className="flex flex-col items-start">
        <span className="text-[#8E8E93] text-xs font-medium">{label}</span>
        <span className="text-[#E15859] font-bold">{value || "Не указано"}</span>
      </div>
      <ChevronRight className="text-[#D1D1D1]" size={20} />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col pb-12" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Top Controls */}
      <div className="px-6 flex justify-between items-center mb-6 mt-4">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="text-[#E15859]" size={24} />
        </button>
        <button className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
          <Settings className="text-[#E15859]" size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-32">
        {/* Profile Header */}
        <div className="bg-white rounded-[32px] p-6 flex flex-col items-center shadow-sm">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#E9E9E9] bg-gray-200">
              {userData.photo ? (
                <img src={userData.photo} alt={userData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera size={40} />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#E15859] rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <h2 className="text-[#E15859] text-3xl font-black uppercase italic mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {userData.name || "ПАВЕЛ"}
          </h2>
          <button className="w-full py-4 rounded-full bg-[#E15859] text-white font-bold shadow-md">
            Изменить фото
          </button>
        </div>

        {/* Identification */}
        <div className="space-y-3">
          <h3 className="text-[#404243] font-bold text-center text-sm uppercase tracking-wider">Идентификация</h3>
          <div className="bg-white rounded-[32px] px-6 py-2 shadow-sm">
            {renderField("Возраст", userData.age, "age")}
            {renderField("Пол", userData.gender === "male" ? "Мужской" : userData.gender === "female" ? "Женский" : null, "gender")}
            {renderField("Семейный статус", userData.relationship === "single" ? "Без партнера" : userData.relationship === "in_relationship" ? "В отношениях / в браке" : null, "relationship")}
            {renderField("Дети", userData.children === "yes" ? "Есть" : userData.children === "no" ? "Нет" : null, "children")}
            {renderField("Сфера деятельности", userData.occupation, "occupation")}
          </div>
        </div>

        {/* Action Button Floating (Middle-ish in 62.png) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-16 h-16 rounded-full border-2 border-[#E15859] flex items-center justify-center bg-white shadow-sm"
          >
            <ChevronRight className="text-[#E15859] rotate-180" size={32} />
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 h-16 rounded-full bg-[#E15859] text-white font-bold text-lg shadow-lg hover:bg-[#d14849] transition-all"
          >
            Сохранить изменения
          </button>
        </div>

        {/* Interest/Excitement */}
        <div className="space-y-3">
          <div className="bg-white rounded-[32px] px-6 py-2 shadow-sm">
            {renderField("Азарт", userData.interest, "interest")}
            {renderField("Формат общения", userData.communicationFormat === "light" ? "Легкое, непринужденное общение" : userData.communicationFormat === "active" ? "Активный отдых" : null, "communicationFormat")}
            {renderField("Сценарий", userData.eveningScenario === "calm" ? "Спокойная и уютная встреча" : userData.eveningScenario === "spontaneous" ? "Приключение" : null, "eveningScenario")}
            {renderField("Основа мнений", userData.comfort, "comfort")}
            {renderField("Насколько ты интроверт", userData.socialFrequency, "socialFrequency")}
          </div>
        </div>

        {/* About Me */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[#404243] font-bold text-sm uppercase tracking-wider">О себе</h3>
            <span className="text-[#8E8E93] text-xs">{aboutMe.length}/500</span>
          </div>
          <div className="bg-white rounded-[32px] p-6 shadow-sm min-h-[200px]">
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value.slice(0, 500))}
              placeholder="Введи описание..."
              className="w-full h-full min-h-[150px] bg-transparent resize-none focus:outline-none text-[#404243]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            />
          </div>
        </div>

        {/* Social Networks */}
        <div className="space-y-3 pb-8">
          <h3 className="text-[#404243] font-bold text-center text-sm uppercase tracking-wider">Социальные сети</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-full px-4 py-3 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-[#E15859] rounded-full flex items-center justify-center">
                <Send size={20} className="text-white fill-white translate-x-[-1px]" />
              </div>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Введите никнейм"
                className="flex-1 bg-transparent focus:outline-none text-[#404243] font-medium"
              />
              <ChevronRight className="text-[#D1D1D1]" size={20} />
            </div>
            <div className="bg-white rounded-full px-4 py-3 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-[#E15859] rounded-full flex items-center justify-center">
                <Instagram size={20} className="text-white" />
              </div>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Введите никнейм"
                className="flex-1 bg-transparent focus:outline-none text-[#404243] font-medium"
              />
              <ChevronRight className="text-[#D1D1D1]" size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

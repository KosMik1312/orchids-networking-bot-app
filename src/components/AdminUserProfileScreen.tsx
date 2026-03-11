import React from "react";
import { ArrowLeft, User, MapPin, Briefcase, Heart, MessageCircle, Star, Target, Info } from "lucide-react";
import { AdminUserProfile } from "../lib/adminApi";

interface AdminUserProfileScreenProps {
  userMap: AdminUserProfile;
  onBack: () => void;
}

export function AdminUserProfileScreen({ userMap, onBack }: AdminUserProfileScreenProps) {
  // Helpers to render arrays or single strings
  const renderList = (items: string | string[] | undefined) => {
    if (!items) return null;
    const itemsArray = Array.isArray(items) ? items : [items];
    return itemsArray.filter(Boolean).map((item, idx) => (
      <div key={idx} className="bg-white rounded-[20px] px-5 py-4 mb-2 shadow-sm border border-gray-100">
        <span className="text-[#404243] text-[15px]">{item}</span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF", fontFamily: "system-ui, sans-serif" }}>
      {/* HEADER */}
      <div className="flex items-center gap-3 px-5 py-6 bg-white shadow-sm sticky top-0 z-20">
        <button onClick={onBack} className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center">
          <ArrowLeft size={20} className="text-[#404243]" />
        </button>
        <div>
          <h1 className="text-[#E15859] text-lg font-bold uppercase tracking-tight leading-tight">Профиль ID: {userMap.user_id}</h1>
          <div className="text-xs text-gray-500">
            {userMap.is_profile_completed ? "Анкета заполнена" : "Анкета не заполнена"}
            {userMap.created_at && ` • ${new Date(userMap.created_at).toLocaleDateString("ru-RU")}`}
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-8 pb-12 space-y-8">

        {/* PROFILE HEADER (Avatar & Name) */}
        <div className="flex flex-col items-center">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative z-10">
            {userMap.photo ? (
              <img src={userMap.photo} alt={userMap.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <User className="text-white w-12 h-12" />
            )}
          </div>
          <div className="bg-white rounded-[24px] w-full pt-16 pb-6 -mt-[60px] shadow-sm text-center px-4">
            <h2 className="text-[#E15859] text-[26px] font-black uppercase tracking-tight">
              {userMap.name || "Без имени"}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[#8E8E93] text-[14px] font-medium">
              {userMap.city && <span className="flex items-center gap-1 bg-[#F5F5F5] px-3 py-1 rounded-full"><MapPin size={14}/> {userMap.city}</span>}
              {userMap.age && <span className="bg-[#F5F5F5] px-3 py-1 rounded-full">{userMap.age} лет</span>}
              {userMap.gender && <span className="bg-[#F5F5F5] px-3 py-1 rounded-full">{userMap.gender === 'male' ? 'Мужской' : userMap.gender === 'female' ? 'Женский' : userMap.gender}</span>}
              {userMap.zodiac && <span className="bg-[#F5F5F5] px-3 py-1 rounded-full">{userMap.zodiac}</span>}
            </div>
            
            {(userMap.telegram || userMap.instagram) && (
               <div className="mt-4 flex flex-col gap-2 items-center">
                  {userMap.telegram && (
                      <a href={`https://t.me/${userMap.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-blue-500 text-sm font-medium hover:underline">
                          @{userMap.telegram.replace('@', '')}
                      </a>
                  )}
                  {userMap.instagram && (
                      <span className="text-[#E1306C] text-sm font-medium">Inst: {userMap.instagram}</span>
                  )}
               </div>
            )}
          </div>
        </div>

        {/* ABOUT ME */}
        {userMap.about_me && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Info size={18} className="text-[#E15859]" />
              <h3 className="text-[#404243] font-bold text-[16px]">О себе</h3>
            </div>
            <div className="bg-white rounded-[24px] p-5 shadow-sm text-[#404243] text-[15px] leading-relaxed border border-gray-100 whitespace-pre-wrap">
              {userMap.about_me}
            </div>
          </div>
        )}

        {/* WORK & LIFE */}
        <div className="space-y-4">
          {userMap.occupation && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-2">
                <Briefcase size={18} className="text-[#E15859]" />
                <h3 className="text-[#404243] font-bold text-[16px]">Сфера деятельности</h3>
              </div>
              <div className="bg-white rounded-[20px] px-5 py-4 shadow-sm border border-gray-100 text-[#404243]">
                {userMap.occupation}
              </div>
            </div>
          )}

          {userMap.relationship_status && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-2">
                <Heart size={18} className="text-[#E15859]" />
                <h3 className="text-[#404243] font-bold text-[16px]">Семейное положение</h3>
              </div>
              <div className="bg-white rounded-[20px] px-5 py-4 shadow-sm border border-gray-100 text-[#404243]">
                {userMap.relationship_status}
                {userMap.children && ` • Дети: ${userMap.children}`}
              </div>
            </div>
          )}
        </div>

        {/* LIST FIELDS */}
        {userMap.interests && (
          <div>
            <h3 className="text-[#E15859] font-bold text-[16px] mb-3 px-2 uppercase tracking-wide text-center">Интересы и хобби</h3>
            {renderList(userMap.interests)}
          </div>
        )}

        {userMap.goal && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <Target size={18} className="text-[#E15859]" />
              <h3 className="text-[#404243] font-bold text-[16px]">Кого или что я ищу</h3>
            </div>
            {renderList(userMap.goal)}
          </div>
        )}

        {userMap.communication_format && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <MessageCircle size={18} className="text-[#E15859]" />
              <h3 className="text-[#404243] font-bold text-[16px]">Формат общения</h3>
            </div>
            {renderList(userMap.communication_format)}
          </div>
        )}

        {/* PREFERENCES */}
        {(userMap.meeting_days || userMap.meeting_time_from || userMap.meeting_metro || userMap.evening_scenario) && (
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-[#E15859] font-bold text-[16px] uppercase tracking-wide text-center mb-4">Предпочтения</h3>
                
                {userMap.meeting_days && (
                    <div>
                        <span className="text-gray-400 text-[13px] block mb-1">Дни для встреч</span>
                        <div className="text-[#404243] font-medium">{Array.isArray(userMap.meeting_days) ? userMap.meeting_days.join(', ') : userMap.meeting_days}</div>
                    </div>
                )}
                
                {(userMap.meeting_time_from || userMap.meeting_time_to) && (
                    <div>
                        <span className="text-gray-400 text-[13px] block mb-1">Удобное время</span>
                        <div className="text-[#404243] font-medium">{userMap.meeting_time_from || '?'} - {userMap.meeting_time_to || '?'}</div>
                    </div>
                )}

                {userMap.meeting_metro && (
                    <div>
                        <span className="text-gray-400 text-[13px] block mb-1">Локации (Метро)</span>
                        <div className="text-[#404243] font-medium">{Array.isArray(userMap.meeting_metro) ? userMap.meeting_metro.join(', ') : userMap.meeting_metro}</div>
                    </div>
                )}

                {userMap.evening_scenario && (
                    <div>
                        <span className="text-gray-400 text-[13px] block mb-1">Идеальный вечер</span>
                        <div className="text-[#404243] font-medium">{userMap.evening_scenario}</div>
                    </div>
                )}
            </div>
        )}

        {/* DEEP FIELDS */}
        {(userMap.strengths || userMap.weaknesses || userMap.values || userMap.love_language || userMap.goals || userMap.dreams) && (
            <div className="pt-4 border-t-2 border-dashed border-gray-200 space-y-6">
                <h3 className="text-center text-gray-400 font-medium uppercase tracking-widest text-sm">Глубокие вопросы</h3>
                
                {userMap.strengths && (
                    <div>
                        <div className="flex items-center gap-2 mb-2 px-2">
                        <Star size={18} className="text-[#E15859]" />
                        <h3 className="text-[#404243] font-bold text-[16px]">Сильные стороны</h3>
                        </div>
                        {renderList(userMap.strengths)}
                    </div>
                )}
                
                 {userMap.weaknesses && (
                     <div>
                        <span className="text-gray-500 font-medium text-[14px] px-2 block mb-2">Точки роста (слабости)</span>
                        <div className="bg-white rounded-[20px] px-5 py-4 shadow-sm border border-gray-100 text-[#404243]">
                            {userMap.weaknesses}
                        </div>
                     </div>
                 )}

                 {userMap.values && (
                      <div>
                        <span className="text-gray-500 font-medium text-[14px] px-2 block mb-2">Главные ценности</span>
                        {renderList(userMap.values)}
                     </div>
                 )}

                 {userMap.goals && (
                      <div>
                        <span className="text-gray-500 font-medium text-[14px] px-2 block mb-2">Ближайшие цели</span>
                        <div className="bg-white rounded-[20px] px-5 py-4 shadow-sm border border-gray-100 text-[#404243]">
                            {userMap.goals}
                        </div>
                     </div>
                 )}

                 {userMap.dreams && (
                      <div>
                        <span className="text-gray-500 font-medium text-[14px] px-2 block mb-2">Мечты</span>
                        <div className="bg-white rounded-[20px] px-5 py-4 shadow-sm border border-gray-100 text-[#404243]">
                            {userMap.dreams}
                        </div>
                     </div>
                 )}
            </div>
        )}

      </div>
    </div>
  );
}

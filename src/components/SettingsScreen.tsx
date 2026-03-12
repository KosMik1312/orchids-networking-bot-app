"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ru } from "@/lib/i18n";

interface SettingsScreenProps {
  onBack?: () => void;
  onPrivacy?: () => void;
  onOffer?: () => void;
  onConsent?: () => void;
  onEmailConsent?: () => void;
  userId?: number;
  authToken?: string | null;
}

export function SettingsScreen({ onBack, onPrivacy, onOffer, onConsent, onEmailConsent, userId, authToken }: SettingsScreenProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuItems = [
    { label: ru.settings.privacyText, onClick: onPrivacy },
    { label: ru.settings.offerText, onClick: onOffer },
    { label: ru.settings.consentText, onClick: onConsent },
    { label: "Согласие на рассылку", onClick: onEmailConsent },
  ];

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      <div className="flex-1 px-6 pb-8 flex flex-col">
        {/* Title */}
        <h1
          className="text-[#E15859] text-[32px] font-black uppercase text-center tracking-tight leading-none mt-12 mb-8"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {ru.settings.title}
        </h1>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center justify-between px-6 py-5 rounded-[20px] bg-white shadow-sm"
            >
              <span className="text-[#404243] text-[15px] font-medium">{item.label}</span>
              <ChevronRight className="text-[#BDBDBD]" size={20} />
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={onBack}
            className="w-14 h-14 bg-[#E15859] rounded-full flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="text-white" size={28} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 py-4 rounded-full border-2 border-[#E15859] text-[#E15859] text-[17px] font-semibold bg-white"
          >
            {ru.settings.deleteAccount}
          </button>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Dimmed background */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowDeleteConfirm(false)}
          />

          {/* Overlay on top of the screen content */}
          <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: "rgba(233,233,233,0.6)" }}>
            {/* Title (faded) */}
            <h1
              className="text-[#E15859] text-[32px] font-black uppercase text-center tracking-tight leading-none mt-12 mb-8 opacity-30"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {ru.settings.title}
            </h1>

            {/* Menu items (faded) */}
            <div className="px-6 space-y-3 opacity-30">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between px-6 py-5 rounded-[20px] bg-white shadow-sm"
                >
                  <span className="text-[#404243] text-[15px] font-medium">{item.label}</span>
                  <ChevronRight className="text-[#BDBDBD]" size={20} />
                </div>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Confirmation card */}
            <div className="px-6 pb-8">
              <div className="bg-white rounded-[24px] px-6 py-8 shadow-lg">
                <h2
                  className="text-[#2A2021] text-[22px] font-black uppercase text-center tracking-tight leading-tight mb-3"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {ru.settings.deleteConfirmTitle}
                </h2>
                <p className="text-[#8E8E93] text-[14px] text-center leading-relaxed mb-6">
                  {ru.settings.deleteConfirmText}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    disabled={isDeleting}
                    onClick={async () => {
                      // ✅ 1. Валидация перед отправкой
                      if (!userId) {
                        console.error("❌ userId is undefined - cannot delete profile");
                        alert("Ошибка: ID пользователя не найден. Попробуйте перезагрузить приложение.");
                        return;
                      }

                      if (!authToken) {
                        console.error("❌ authToken is undefined - cannot delete profile");
                        alert("Ошибка: Не удалось аутентифицироваться. Попробуйте заново войти.");
                        return;
                      }

                      setIsDeleting(true);
                      console.log("🗑️ [DELETE] Starting profile deletion for user:", userId);

                      try {
                        const { deleteProfile } = await import("@/lib/api");
                        
                        console.log("📤 [DELETE] Sending DELETE request to /api/profile");
                        console.log("📤 [DELETE] userId:", userId);
                        console.log("📤 [DELETE] authToken present:", !!authToken);
                        
                        // ✅ 2. Отправляем запрос с валидными параметрами
                        const result = await deleteProfile(userId, authToken);
                        
                        console.log("📡 [DELETE] Response:", result);
                        
                        // ✅ 3. Проверяем успешность ответа
                        if (result.success) {
                          console.log("✅ [DELETE] Profile deleted successfully!");
                          // Небольшая задержка перед редиректом для UI feedback
                          setTimeout(() => {
                            window.location.href = "/?screen=welcome";
                          }, 500);
                        } else {
                          console.error("❌ [DELETE] API returned unsuccessful result:", result);
                          alert("Ошибка при удалении: сервер вернул некорректный ответ");
                          setIsDeleting(false);
                        }
                      } catch (error: any) {
                        console.error("❌ [DELETE] Error during profile deletion:");
                        console.error("Error message:", error.message);
                        console.error("Error details:", error);
                        
                        // ✅ 4. Информативная обработка разных типов ошибок
                        let errorMessage = "Произошла ошибка при удалении аккаунта";
                        
                        if (error.message?.includes("401")) {
                          errorMessage = "Ошибка аутентификации. Попробуйте заново войти.";
                        } else if (error.message?.includes("404")) {
                          errorMessage = "Профиль пользователя не найден.";
                        } else if (error.message?.includes("500")) {
                          errorMessage = "Ошибка сервера. Попробуйте позже.";
                        } else if (error.message) {
                          errorMessage = `Ошибка: ${error.message}`;
                        }
                        
                        alert(errorMessage);
                        setIsDeleting(false);
                      }
                    }}
                    className={`w-full py-4 rounded-[20px] text-white text-[17px] font-semibold ${isDeleting ? "bg-gray-400" : "bg-[#E15859]"
                      }`}
                  >
                    {isDeleting ? "Удаление..." : ru.settings.deleteConfirmButton}
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-4 rounded-[20px] border-2 border-[#E15859] bg-white text-[#E15859] text-[17px] font-semibold"
                  >
                    {ru.settings.deleteCancelButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

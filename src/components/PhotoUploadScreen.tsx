"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Image as ImageIcon } from "lucide-react";

interface PhotoUploadScreenProps {
  onNext: (photo: string) => void;
  onBack: () => void;
  progress: number;
}

export function PhotoUploadScreen({ onNext, onBack, progress }: PhotoUploadScreenProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Check size (10MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      setError("Размер фото не должен превышать 10 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    if (photo) {
      onNext(photo);
    }
  };

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-16 pb-12 shrink-0">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: "#C8CACB" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ backgroundColor: "#404243", width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="px-10 mb-8 shrink-0 text-center">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          ДОБАВЬ ФОТО
        </h2>
        <p 
          className="mt-2 text-[14px] font-medium" 
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#707579" }}
        >
          Максимальный размер файла: 10 МБ
        </p>
      </div>

      {/* Upload Area */}
      <div className="flex-1 px-6 flex flex-col items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <div 
          className="relative w-[240px] h-[240px] rounded-full overflow-hidden flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#E15859" }}
          onClick={handleButtonClick}
        >
          {photo ? (
            <img 
              src={photo} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon size={100} color="white" strokeWidth={1.5} />
          )}
        </div>

        {error && (
          <p 
            className="mt-4 text-center text-[14px] font-semibold text-red-500 animate-pulse"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleButtonClick}
          className="mt-8 px-8 py-3 rounded-full border-[1.5px] text-[18px] font-semibold transition-all active:scale-95"
          style={{ 
            borderColor: "#E15859", 
            color: "#E15859",
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          {photo ? "Заменить" : "Добавить"}
        </button>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between px-10 pb-12 gap-4 shrink-0">
        <button
          onClick={onBack}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-[1.5px] transition-colors active:scale-95 shrink-0"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={28} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={handleContinue}
          className="h-[64px] flex-1 rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: !photo ? "rgba(225, 88, 89, 0.3)" : "#E15859",
            color: "white",
            fontFamily: "'Montserrat', sans-serif",
          }}
          disabled={!photo}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}

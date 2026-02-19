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

    setError(null);

    if (file.size > 10 * 1024 * 1024) {
      setError("Размер фото не должен превышать 10 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => fileInputRef.current?.click();
  const handleContinue = () => { if (photo) onNext(photo); };

  return (
    <div className="flex h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
      <div className="px-6 pt-6">
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ChevronLeft className="text-[#E15859]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-6 text-center">
          <h2 className="text-[#2A2021] text-2xl font-bold">Загрузите фото</h2>
          <p className="text-[#8E8E93] mt-2">Фото поможет другим пользователям узнать вас</p>
        </div>

        <div className="w-[180px] h-[180px] rounded-full bg-white overflow-hidden mb-4 shadow flex items-center justify-center">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="photo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-[#BDBDBD]"><ImageIcon size={48} /></div>
          )}
        </div>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button onClick={handleButtonClick} className="px-6 py-3 bg-[#E15859] text-white rounded-[18px] mb-3">Выбрать фото</button>
        <button onClick={handleContinue} disabled={!photo} className={`px-6 py-3 rounded-[18px] ${photo ? 'bg-[#2A7A53] text-white' : 'bg-[#E15859]/40 text-white/60 cursor-not-allowed'}`}>
          Продолжить
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="text-sm text-[#8E8E93]">Прогресс: {progress}%</div>
      </div>
    </div>
  );
}

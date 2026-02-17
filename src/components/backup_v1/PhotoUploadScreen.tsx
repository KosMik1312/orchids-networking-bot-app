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
    <div className="flex h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
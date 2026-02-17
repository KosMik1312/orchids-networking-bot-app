"use client";

import { useState } from "react";
import { ChevronLeft, Send, Instagram } from "lucide-react";

interface SocialLinksScreenProps {
  onNext: (socials: { telegram: string; instagram: string }) => void;
  onBack: () => void;
  progress: number;
}

export function SocialLinksScreen({ onNext, onBack, progress }: SocialLinksScreenProps) {
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");

  const handleContinue = () => {
    onNext({ telegram, instagram });
  };

  const isFilled = telegram.trim() !== "" || instagram.trim() !== "";

  return (
    <div className="flex h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
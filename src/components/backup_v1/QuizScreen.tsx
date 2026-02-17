"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ChevronLeft } from "lucide-react";

interface QuizScreenProps {
  onNext: (name: string) => void;
  onBack: () => void;
  progress: number;
}

export function QuizScreen({ onNext, onBack, progress }: QuizScreenProps) {
  const [name, setName] = useState("");

  const handleContinue = () => {
    if (name.trim()) {
      onNext(name);
    }
  };

  const isNameEmpty = !name.trim();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF7EF", touchAction: "pan-y" }}>
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ru } from "@/lib/i18n";

interface Promotion {
  id: number;
  title: string;
  shortText: string;
  fullText: string;
  price: string;
}

interface PromotionsScreenProps {
  onBack?: () => void;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: "Ужин в подарок",
    shortText: "Получите бесплатный ужин при бронировании столика на 4 персоны...",
    fullText: "Получите бесплатный ужин при бронировании столика на 4 персоны. Акция действует в выходные дни. Насладитесь изысканной кухней в компании друзей!",
    price: "Бесплатно",
  },
  {
    id: 2,
    title: "Скидка на день рождения",
    shortText: "Празднуйте с нами! Скидка 20% для именинников...",
    fullText: "Празднуйте с нами! Скидка 20% для именинников действует в течение недели до и после вашего дня рождения. Предъявите паспорт для получения скидки.",
    price: "-20%",
  },
  {
    id: 3,
    title: "Романтический вечер",
    shortText: "Специальное предложение для пар: сет из 3 блюд и бутылка вина...",
    fullText: "Специальное предложение для пар: сет из 3 блюд и бутылка вина по специальной цене. Проведите незабываемый вечер в романтической обстановке.",
    price: "5000 ₽",
  },
];

function DiscountBadge() {
  return (
    <div className="w-9 h-9 bg-[#E15859] rounded-full flex items-center justify-center ml-2 shrink-0">
      <span className="text-white text-[14px] font-bold">%</span>
    </div>
  );
}

function PromotionCard({ promo }: { promo: Promotion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[20px] px-6 py-6 shadow-sm">
      <div className="flex items-center mb-3">
        <h3 className="text-[#2A2021] text-[22px] font-bold">{promo.title}</h3>
        <DiscountBadge />
      </div>

      <p className="text-[#404243] text-[14px] leading-relaxed mb-4">
        {expanded ? promo.fullText : promo.shortText}{" "}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#E15859] font-medium"
        >
          {expanded ? ru.promotions.collapse : ru.promotions.expand}
        </button>
      </p>

      <div className="flex items-center gap-4">
        <button className="bg-[#E15859] text-white text-[15px] font-semibold px-8 py-3 rounded-[14px]">
          {ru.promotions.buyButton}
        </button>
        <span className="text-[#2A2021] text-[16px] font-semibold">{promo.price}</span>
      </div>
    </div>
  );
}

export function PromotionsScreen({ onBack }: PromotionsScreenProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      {/* Title */}
      <h2
        className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none px-6 mt-12 mb-6"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {ru.promotions.title}
      </h2>

      {/* Promotions List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {promotions.map((promo) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: promo.id * 0.08 }}
          >
            <PromotionCard promo={promo} />
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <div className="px-6 pb-10 pt-2">
        <button
          onClick={onBack}
          className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold"
        >
          {ru.common.back}
        </button>
      </div>
    </div>
  );
}

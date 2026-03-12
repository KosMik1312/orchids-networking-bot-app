"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ru } from "@/lib/i18n";
import { getPromotions, createPayment, type Promotion } from "@/lib/api";

interface PromotionsScreenProps {
  authToken?: string | null;
  onBack?: () => void;
  onBuy?: (promotionId: number) => void;
}

function DiscountBadge() {
  return (
    <div className="w-9 h-9 bg-[#E15859] rounded-full flex items-center justify-center ml-2 shrink-0">
      <span className="text-white text-[14px] font-bold">%</span>
    </div>
  );
}

function PromotionCard({ promo, onBuy, isBuying }: { promo: Promotion; onBuy?: (id: number) => void; isBuying: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString("ru-RU") + " ₽";
  };

  return (
    <div className="bg-white rounded-[20px] px-6 py-6 shadow-sm">
      <div className="flex items-center mb-3">
        <h3 className="text-[#2A2021] text-[22px] font-bold">{promo.title}</h3>
        <DiscountBadge />
      </div>

      <p className="text-[#404243] text-[14px] leading-relaxed mb-2">
        {expanded ? promo.description : promo.description.length > 100 ? promo.description.slice(0, 100) + "..." : promo.description}
        {promo.description.length > 100 && (
          <>
            {" "}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#E15859] font-medium"
            >
              {expanded ? ru.promotions.collapse : ru.promotions.expand}
            </button>
          </>
        )}
      </p>

      {promo.target_audience && (
        <p className="text-[#8E8E93] text-[13px] mb-1">
          <span className="font-semibold text-[#404243]">Для кого: </span>
          {promo.target_audience}
        </p>
      )}

      <div className="flex gap-2 text-[12px] text-[#8E8E93] mb-4">
        <span className="bg-[#FDEEEE] text-[#E15859] px-2 py-0.5 rounded-full font-medium">
          {promo.quantity} {promo.quantity === 1 ? "посещение" : promo.quantity < 5 ? "посещения" : "посещений"}
        </span>
        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
          {promo.validity_days} дней
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="bg-[#E15859] text-white text-[15px] font-semibold px-8 py-3 rounded-[14px] disabled:opacity-50"
          onClick={() => onBuy?.(promo.id)}
          disabled={isBuying}
        >
          {isBuying ? "Загрузка..." : ru.promotions.buyButton}
        </button>
        <span className="text-[#2A2021] text-[16px] font-semibold">{formatPrice(promo.price)}</span>
      </div>
    </div>
  );
}

export function PromotionsScreen({ authToken, onBack, onBuy }: PromotionsScreenProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPromotions() {
      try {
        setIsLoading(true);
        const data = await getPromotions();
        if (isMounted) {
          setPromotions(data.promotions || []);
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
        if (isMounted) setError("Не удалось загрузить акции");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchPromotions();
    return () => { isMounted = false; };
  }, []);

  const handleBuy = async (promotionId: number) => {
    if (!authToken) return;
    setBuyingId(promotionId);
    setError(null);

    try {
      const promo = promotions.find((p) => p.id === promotionId);
      if (!promo) return;

      const returnUrl = window.location.href;
      const paymentResult = await createPayment(
        {
          amount: String(promo.price),
          promotionId: promotionId,
          returnUrl,
        },
        authToken
      );

      if (paymentResult.confirmationUrl) {
        // Перенаправляем на страницу оплаты YooKassa
        window.location.href = paymentResult.confirmationUrl;
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Ошибка при создании платежа");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      {/* Title */}
      <h2
        className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none px-6 mt-12 mb-6"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {ru.promotions.title}
      </h2>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#8E8E93] text-[16px]">Загрузка...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-[#8E8E93] text-[16px] text-center">
            Пока нет активных акций и предложений
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {promotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <PromotionCard
                promo={promo}
                onBuy={handleBuy}
                isBuying={buyingId === promo.id}
              />
            </motion.div>
          ))}
        </div>
      )}

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

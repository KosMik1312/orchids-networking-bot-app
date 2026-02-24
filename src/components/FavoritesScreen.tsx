"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { getSlots, type Slot } from "@/lib/api";
import { ru } from "@/lib/i18n";

interface FavoritesScreenProps {
  city?: string;
  favoriteIds: Set<number>;
  onBack?: () => void;
  onBook?: (eventId: number) => void;
  onToggleFavorite?: (eventId: number) => void;
}

export function FavoritesScreen({ city = "Москва", favoriteIds, onBack, onBook, onToggleFavorite }: FavoritesScreenProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      try {
        setIsLoading(true);
        const data = await getSlots(city);
        if (isMounted) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchSlots();
    return () => { isMounted = false; };
  }, [city]);

  const favorites = slots.filter((s) => favoriteIds.has(s.id));

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      <div className="flex-1 flex flex-col px-6 pb-32 pt-8">
        {/* Title */}
        <h2
          className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-6"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {ru.favorites.title}
        </h2>

        {/* Favorites List */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#8E8E93] text-[16px]">{ru.loading.defaultMessage}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#8E8E93] text-[16px]">{ru.favorites.noEvents}</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {favorites.map((slot) => {
              const seatsAvailable = slot.max_people - slot.current_bookings;
              return (
                <div key={slot.id} className="bg-white rounded-[20px] overflow-hidden shadow-sm">
                  <div className="px-6 pt-5 pb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-[#2A2021] text-[20px] font-bold">{slot.restaurant}</h3>
                      <p className="text-[#8E8E93] text-[15px] mt-1">{formatDate(slot.date)}</p>
                      <p className="text-[#8E8E93] text-[15px]">{slot.time}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite?.(slot.id)}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E15859]"
                      >
                        <Heart className="text-white" size={20} fill="white" />
                      </button>
                      <span className="text-[#8E8E93] text-[11px] text-center leading-tight">
                        {ru.afisha.seatsAvailable
                          .replace("{available}", seatsAvailable.toString())
                          .replace("{total}", slot.max_people.toString())}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onBook?.(slot.id)}
                    className="w-full py-3 bg-[#E15859] text-white text-[15px] font-semibold"
                    disabled={seatsAvailable <= 0}
                  >
                    {seatsAvailable > 0 ? ru.afisha.bookButton : ru.afisha.noSeatsButton}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-6"
        >
          {ru.common.back}
        </button>
      </div>
    </div>
  );
}

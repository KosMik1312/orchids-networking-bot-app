"use client";

import { useState, useEffect } from "react";
import { MapPin, Heart } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { getSlots, type Slot } from "@/lib/api";
import { ru } from "@/lib/i18n";

interface AfishaScreenProps {
  city?: string;
  onFavorites?: () => void;
  onHome?: () => void;
  onProfile?: () => void;
  onBook?: (eventId: number) => void;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (eventId: number) => void;
}

export function AfishaScreen({ city = "Москва", onFavorites, onHome, onProfile, onBook, favoriteIds = new Set(), onToggleFavorite }: AfishaScreenProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      try {
        setIsLoading(true);
        const data = await getSlots("all");
        if (isMounted) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(ru.afisha.errorLoad);
          console.error(err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchSlots();
    return () => { isMounted = false; };
  }, [city]);

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
      <div className="flex-1 flex flex-col px-6 pt-12 pb-32">
        {/* Location & Favorites */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
            <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
              <MapPin className="text-white" size={22} fill="white" />
            </div>
            <span className="font-medium text-[#404243] text-[15px] pr-2">Все города</span>
          </div>
          <button
            onClick={onFavorites}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <Heart className="text-[#E15859]" size={24} fill="#E15859" />
          </button>
        </div>

        {/* Title */}
        <h2
          className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-6"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {ru.afisha.title}
        </h2>

        {/* Events List */}
        <div className="space-y-4 flex-1">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">{ru.afisha.loading}</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-10 text-gray-500">{ru.afisha.noEvents}</div>
          ) : (
            slots.map((slot) => {
              const isFav = favoriteIds.has(slot.id);
              const seatsAvailable = slot.max_people - slot.current_bookings;
              return (
                <div key={slot.id} className="bg-white rounded-[20px] overflow-hidden shadow-sm">
                  <div className="px-6 pt-5 pb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E15859] bg-[#FDEEEE] px-2 py-0.5 rounded-full">
                          {slot.city}
                        </span>
                      </div>
                      <h3 className="text-[#2A2021] text-[20px] font-bold">{slot.restaurant}</h3>
                      <p className="text-[#8E8E93] text-[15px] mt-1">{formatDate(slot.date)}</p>
                      <p className="text-[#8E8E93] text-[15px]">{slot.time}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite?.(slot.id)}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: isFav ? "#E15859" : "#F5D5D5" }}
                      >
                        <Heart
                          className="text-white"
                          size={20}
                          fill={isFav ? "white" : "none"}
                          strokeWidth={isFav ? 0 : 2}
                          stroke={isFav ? undefined : "white"}
                        />
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
            })
          )}
        </div>
      </div>

      <BottomNav activeTab="afisha" onTabChange={(tab) => {
        if (tab === "home") onHome?.();
        if (tab === "profile") onProfile?.();
      }} />
    </div>
  );
}

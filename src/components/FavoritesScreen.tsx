"use client";

import { Heart } from "lucide-react";

interface FavoriteEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  seatsAvailable: number;
  seatsTotal: number;
}

interface FavoritesScreenProps {
  favoriteIds: Set<number>;
  onBack?: () => void;
  onBook?: (eventId: number) => void;
  onToggleFavorite?: (eventId: number) => void;
}

const ALL_EVENTS: FavoriteEvent[] = [
  { id: 1, title: "Боулинг", date: "7 января", time: "17:00", seatsAvailable: 8, seatsTotal: 10 },
  { id: 2, title: "Боулинг", date: "7 января", time: "17:00", seatsAvailable: 8, seatsTotal: 10 },
  { id: 3, title: "Боулинг", date: "7 января", time: "17:00", seatsAvailable: 8, seatsTotal: 10 },
];

export function FavoritesScreen({ favoriteIds, onBack, onBook, onToggleFavorite }: FavoritesScreenProps) {
  const favorites = ALL_EVENTS.filter((e) => favoriteIds.has(e.id));

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
        <div className="flex-1 flex flex-col px-6 pb-32 pt-8">
        {/* Title */}
        <h2
          className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-6"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Избранное
        </h2>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#8E8E93] text-[16px]">Нет избранных событий</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {favorites.map((event) => (
              <div key={event.id} className="bg-white rounded-[20px] overflow-hidden shadow-sm">
                <div className="px-6 pt-5 pb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-[#2A2021] text-[20px] font-bold">{event.title}</h3>
                    <p className="text-[#8E8E93] text-[15px] mt-1">{event.date}</p>
                    <p className="text-[#8E8E93] text-[15px]">{event.time}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite?.(event.id)}
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E15859]"
                    >
                      <Heart className="text-white" size={20} fill="white" />
                    </button>
                    <span className="text-[#8E8E93] text-[11px] text-center leading-tight">
                      Свободных мест {event.seatsAvailable}/{event.seatsTotal}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onBook?.(event.id)}
                  className="w-full py-3 bg-[#E15859] text-white text-[15px] font-semibold"
                >
                  Забронировать
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-6"
        >
          Назад
        </button>
      </div>
    </div>
  );
}

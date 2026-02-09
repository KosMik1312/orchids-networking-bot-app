"use client";

import { useState } from "react";
import { MapPin, Heart } from "lucide-react";
import { BottomNav } from "./BottomNav";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  seatsAvailable: number;
  seatsTotal: number;
}

interface AfishaScreenProps {
  city?: string;
  onFavorites?: () => void;
  onHome?: () => void;
  onBook?: (eventId: number) => void;
  favoriteIds?: Set<number>;
  onToggleFavorite?: (eventId: number) => void;
}

const EVENTS: Event[] = [
  { id: 1, title: "Боулинг", date: "7 января", time: "17:00", seatsAvailable: 8, seatsTotal: 10 },
  { id: 2, title: "Боулинг", date: "7 января", time: "17:00", seatsAvailable: 8, seatsTotal: 10 },
  { id: 3, title: "Боулинг", date: "7 января", time: "17:00", seatsAvailable: 8, seatsTotal: 10 },
];

export function AfishaScreen({ city = "Москва", onFavorites, onHome, onBook, favoriteIds = new Set(), onToggleFavorite }: AfishaScreenProps) {
  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-4">
        <button className="text-[#2A2021] font-medium text-[17px]">
          Cancel
        </button>
        <div className="flex flex-col items-center">
          <span className="font-serif text-xl leading-tight" style={{ fontFamily: "'Times New Roman', serif" }}>Allora</span>
          <span className="text-[10px] text-[#8E8E93] tracking-wide">bot</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-32">
        {/* Location & Favorites */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
            <div className="w-12 h-12 bg-[#E15859] rounded-full flex items-center justify-center">
              <MapPin className="text-white" size={22} fill="white" />
            </div>
            <span className="font-medium text-[#404243] text-[15px] pr-2">г. {city}</span>
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
          Афиша
        </h2>

        {/* Events List */}
        <div className="space-y-4 flex-1">
          {EVENTS.map((event) => {
            const isFav = favoriteIds.has(event.id);
            return (
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
            );
          })}
        </div>
      </div>

      <BottomNav activeTab="afisha" onTabChange={(tab) => {
        if (tab === "home") onHome?.();
      }} />
    </div>
  );
}

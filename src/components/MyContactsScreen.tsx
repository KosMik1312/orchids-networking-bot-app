"use client";

import { useState } from "react";
import { ChevronLeft, MessageCircle, Instagram } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  photo: string | null;
  event: string;
  date: string;
  telegram?: string;
  instagram?: string;
}

interface MyContactsScreenProps {
  onBack?: () => void;
}

const CONTACTS: Contact[] = [
  {
    id: 1,
    name: "Анна",
    photo: null,
    event: "Ужин в ресторане «Прага»",
    date: "15 декабря 2024",
    telegram: "@anna_m",
    instagram: "@anna.moscow",
  },
  {
    id: 2,
    name: "Дмитрий",
    photo: null,
    event: "Боулинг",
    date: "22 декабря 2024",
    telegram: "@dmitriy_k",
  },
  {
    id: 3,
    name: "Елена",
    photo: null,
    event: "Ужин в ресторане «Прага»",
    date: "15 декабря 2024",
    instagram: "@elena.spb",
  },
  {
    id: 4,
    name: "Максим",
    photo: null,
    event: "Новогодняя вечеринка",
    date: "31 декабря 2024",
    telegram: "@max_party",
    instagram: "@max.life",
  },
  {
    id: 5,
    name: "Ольга",
    photo: null,
    event: "Боулинг",
    date: "22 декабря 2024",
    telegram: "@olga_v",
  },
];

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

const AVATAR_COLORS = ["#E15859", "#E8A87C", "#D4A5A5", "#C27BA0", "#7986CB"];

export function MyContactsScreen({ onBack }: MyContactsScreenProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
        {/* Title */}
        <h2
          className="text-[#E15859] text-[28px] font-black uppercase text-center tracking-tight leading-none mb-6"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Мои контакты
        </h2>

        {/* Contacts List */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {CONTACTS.map((contact, index) => (
            <div
              key={contact.id}
              className="bg-white rounded-[20px] px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                >
                  <span className="text-white text-[20px] font-bold">
                    {getInitials(contact.name)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#2A2021] text-[17px] font-bold">{contact.name}</h3>
                  <p className="text-[#8E8E93] text-[13px] mt-0.5 truncate">{contact.event}</p>
                  <p className="text-[#BDBDBD] text-[12px] mt-0.5">{contact.date}</p>
                </div>

                {/* Social Links */}
                <div className="flex gap-2 flex-shrink-0">
                  {contact.telegram && (
                    <a
                      href={`https://t.me/${contact.telegram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#E15859]/10 rounded-full flex items-center justify-center"
                    >
                      <MessageCircle className="text-[#E15859]" size={18} />
                    </a>
                  )}
                  {contact.instagram && (
                    <a
                      href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#E15859]/10 rounded-full flex items-center justify-center"
                    >
                      <Instagram className="text-[#E15859]" size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-6 flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} />
          Назад
        </button>
      </div>
    </div>
  );
}

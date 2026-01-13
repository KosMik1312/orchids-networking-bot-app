"use client";

import { motion } from "framer-motion";
import { 
  MapPin, 
  Settings, 
  Send, 
  Instagram,
  Headset
} from "lucide-react";
import { BottomNav } from "./BottomNav";

interface Contact {
  id: string;
  name: string;
  image?: string;
  isSupport?: boolean;
  telegram: string;
  instagram: string;
}

const CONTACTS: Contact[] = [
  {
    id: "support",
    name: "Поддержка",
    isSupport: true,
    telegram: "@allora_support",
    instagram: "allora_club",
  },
  {
    id: "mark",
    name: "Марк",
    image: "https://i.pravatar.cc/150?u=mark",
    telegram: "@mark",
    instagram: "mark",
  },
  {
    id: "bill",
    name: "Билл",
    image: "https://i.pravatar.cc/150?u=bill",
    telegram: "@bill",
    instagram: "bill",
  },
  {
    id: "oleg",
    name: "Олег",
    image: "https://i.pravatar.cc/150?u=oleg",
    telegram: "@oleg",
    instagram: "oleg",
  },
  {
    id: "vitalik",
    name: "Виталик",
    image: "https://i.pravatar.cc/150?u=vitalik",
    telegram: "@vitalik",
    instagram: "vitalik",
  },
  {
    id: "sergey",
    name: "Сергей",
    image: "https://i.pravatar.cc/150?u=sergey",
    telegram: "@sergey",
    instagram: "sergey",
  },
];

interface ContactsScreenProps {
  city: string;
  onTabChange: (tab: "home" | "contacts" | "profile") => void;
}

export function ContactsScreen({ city, onTabChange }: ContactsScreenProps) {
  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Top Controls */}
      <div className="px-6 flex justify-between items-center mb-6 mt-4">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm">
          <div className="w-10 h-10 bg-[#E15859] rounded-full flex items-center justify-center">
            <MapPin className="text-white" size={20} fill="white" />
          </div>
          <span className="font-semibold text-[#404243] pr-2">
            {city ? (city.startsWith("г.") ? city : `г. ${city}`) : "г. Москва"}
          </span>
        </div>
        <button className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
          <Settings className="text-[#E15859]" size={24} />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 mb-8">
        <h2 className="text-[#E15859] text-[40px] font-black uppercase text-center tracking-tight leading-none italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          КОНТАКТЫ
        </h2>
      </div>

      {/* Contacts List */}
      <div className="px-6 space-y-4 overflow-y-auto flex-1">
        {CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full shadow-sm ${
              contact.isSupport ? "bg-[#E15859] text-white" : "bg-white text-[#404243]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E9E9E9] flex items-center justify-center border-2 border-white/20">
                {contact.isSupport ? (
                  <Headset className={contact.isSupport ? "text-white" : "text-[#E15859]"} size={24} />
                ) : (
                  <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                )}
              </div>
              <span className={`text-xl font-bold ${contact.isSupport ? "text-white" : "text-[#404243]"}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {contact.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${contact.isSupport ? "bg-white/20 hover:bg-white/30" : "bg-[#E15859] hover:bg-[#d14849]"}`}>
                <Send size={18} className="text-white fill-white translate-x-[-1px]" />
              </button>
              <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${contact.isSupport ? "bg-white hover:bg-gray-100" : "bg-white border border-gray-100 hover:bg-gray-50"}`}>
                <Instagram size={20} className={contact.isSupport ? "text-[#E15859]" : "text-[#E15859]"} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab="contacts" onTabChange={onTabChange} />
    </div>
  );
}

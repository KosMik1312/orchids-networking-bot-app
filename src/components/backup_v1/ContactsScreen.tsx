"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Settings,
  Send,
  Instagram,
  Headset
} from "lucide-react";
import { getContacts, type Contact } from "@/lib/api";

interface ContactsScreenProps {
  city: string;
  slotId?: number;
  userId?: number;
  onBack?: () => void;
  onTabChange: (tab: "home" | "contacts" | "profile") => void;
}

export function ContactsScreen({ city, slotId, userId, onBack, onTabChange }: ContactsScreenProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      if (slotId && userId) {
        const slotContacts = await getContacts(slotId, userId);
        // Add support contact
        const allContacts = [
          {
            id: "support",
            name: "Поддержка",
            isSupport: true,
            telegram: "@allora_support",
            instagram: "allora_club",
          } as Contact,
          ...slotContacts.contacts
        ];
        setContacts(allContacts);
      } else {
        // Default contacts if no slot
        setContacts([
          {
            id: "support",
            name: "Поддержка",
            isSupport: true,
            telegram: "@allora_support",
            instagram: "allora_club",
          }
        ]);
      }
      setIsLoading(false);
    };
    loadContacts();
  }, [slotId, userId]);
  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: "#FFF7EF" }}>
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
        {isLoading ? (
          <div className="text-center py-8">Загрузка контактов...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Нет контактов</div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id || contact.name}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full shadow-sm ${
                contact.isSupport ? "bg-[#E15859] text-white" : "bg-white text-[#404243]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E9E9E9] flex items-center justify-center border-2 border-white/20">
                  {contact.isSupport ? (
                    <Headset className={contact.isSupport ? "text-white" : "text-[#E15859]"} size={24} />
                  ) : contact.photo ? (
                    <img src={contact.photo} alt={contact.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#404243] font-bold text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <span className={`text-xl font-bold ${contact.isSupport ? "text-white" : "text-[#404243]"}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {contact.name}
                  </span>
                  {contact.age && (
                    <span className={`text-sm block ${contact.isSupport ? "text-white/80" : "text-[#404243]/70"}`}>
                      {contact.age} лет
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {contact.telegram && (
                  <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${contact.isSupport ? "bg-white/20 hover:bg-white/30" : "bg-[#E15859] hover:bg-[#d14849]"}`}>
                    <Send size={18} className="text-white fill-white translate-x-[-1px]" />
                  </button>
                )}
                {contact.instagram && (
                  <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${contact.isSupport ? "bg-white hover:bg-gray-100" : "bg-white border border-gray-100 hover:bg-gray-50"}`}>
                    <Instagram size={20} className={contact.isSupport ? "text-[#E15859]" : "text-[#E15859]"} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, MessageCircle, Instagram } from "lucide-react";
import { getUserBookings, getContacts, type Contact } from "@/lib/api";

interface MyContactsScreenProps {
  authToken?: string | null;
  onBack?: () => void;
}

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

const AVATAR_COLORS = ["#E15859", "#E8A87C", "#D4A5A5", "#C27BA0", "#7986CB"];

export function MyContactsScreen({ authToken, onBack }: MyContactsScreenProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchContacts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Сначала получаем бронирования пользователя
        const bookingsData = await getUserBookings(0, authToken || undefined);
        const bookings = bookingsData.bookings || [];
        
        if (!isMounted) return;
        
        // Затем загружаем контакты для каждого слота
        const allContacts: Contact[] = [];
        
        for (const booking of bookings) {
          if (booking.status === 'active' || booking.status === 'completed') {
            try {
              const contactsData = await getContacts(booking.slot_id, authToken || undefined);
              allContacts.push(...(contactsData.contacts || []));
            } catch (err) {
              console.error(`Failed to load contacts for slot ${booking.slot_id}:`, err);
            }
          }
        }
        
        if (isMounted) {
          // Удаляем дубликаты по telegram
          const uniqueContacts = allContacts.filter((contact, index, self) =>
            index === self.findIndex((c) => c.telegram === contact.telegram)
          );
          setContacts(uniqueContacts);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить контакты");
          console.error("Failed to load contacts:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchContacts();
    return () => {
      isMounted = false;
    };
  }, [authToken]);
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
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Загрузка контактов...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>У вас пока нет контактов</p>
              <p className="text-sm mt-2">Посетите мероприятие, чтобы познакомиться</p>
            </div>
          ) : (
            contacts.map((contact, index) => (
              <div
                key={contact.id || index}
                className="bg-white rounded-[20px] px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {contact.photo ? (
                    <img
                      src={contact.photo}
                      alt={contact.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                    >
                      <span className="text-white text-[20px] font-bold">
                        {getInitials(contact.name)}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#2A2021] text-[17px] font-bold">{contact.name}</h3>
                    {contact.age && <p className="text-[#8E8E93] text-[13px] mt-0.5">Возраст: {contact.age}</p>}
                    {contact.city && <p className="text-[#8E8E93] text-[13px]">{contact.city}</p>}
                    {contact.interests && <p className="text-[#BDBDBD] text-[12px] mt-0.5 truncate">{contact.interests}</p>}
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
            ))
          )}
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

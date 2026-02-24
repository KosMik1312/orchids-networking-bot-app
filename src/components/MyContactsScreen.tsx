"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, MessageCircle, Users, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { getUserBookings, getContacts, type Contact, type Booking } from "@/lib/api";
import { ru } from "@/lib/i18n";
import { motion } from "framer-motion";

interface MyContactsScreenProps {
  authToken?: string | null;
  onBack?: () => void;
}

interface GroupedContacts {
  booking: Booking;
  contacts: Contact[];
}

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

const AVATAR_COLORS = ["#E15859", "#E8A87C", "#D4A5A5", "#C27BA0", "#7986CB"];

export function MyContactsScreen({ authToken, onBack }: MyContactsScreenProps) {
  const [groupedContacts, setGroupedContacts] = useState<GroupedContacts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchContacts() {
      try {
        setIsLoading(true);
        setError(null);

        const bookingsData = await getUserBookings(0, authToken || undefined);
        const bookings = bookingsData.bookings || [];

        if (!isMounted) return;

        const results: GroupedContacts[] = [];

        // Load contacts for each booking
        for (const booking of bookings) {
          if (booking.status === 'active' || booking.status === 'completed' || booking.status === 'confirmed') {
            try {
              const contactsData = await getContacts(booking.slot_id, authToken || undefined);
              const slotContacts = contactsData.contacts || [];

              if (slotContacts.length > 0) {
                results.push({
                  booking,
                  contacts: slotContacts
                });
              }
            } catch (err) {
              console.error(`Failed to load contacts for slot ${booking.slot_id}:`, err);
            }
          }
        }

        if (isMounted) {
          setGroupedContacts(results);
        }
      } catch (err) {
        if (isMounted) {
          setError(ru.contacts.errorLoad);
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
      <div className="flex-1 flex flex-col px-5 pt-8 pb-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronLeft size={20} className="text-[#404243]" />
          </button>
          <h1 className="text-[#E15859] text-2xl font-black uppercase tracking-tight">
            {ru.contacts.title}
          </h1>
        </div>

        <div className="space-y-8 flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-[#E15859]/20 border-t-[#E15859] rounded-full animate-spin" />
              <div className="text-[#8E8E93] text-sm font-medium">{ru.contacts.loading}</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-center text-sm font-medium border border-red-100 italic">
              {error}
            </div>
          ) : groupedContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm text-gray-300">
                <Users size={32} />
              </div>
              <div>
                <p className="text-[#404243] font-bold">{ru.contacts.noContacts}</p>
                <p className="text-[#8E8E93] text-sm mt-1">{ru.contacts.noContactsHint}</p>
              </div>
            </div>
          ) : (
            groupedContacts.map((group, groupIdx) => (
              <motion.div
                key={group.booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
                className="space-y-3"
              >
                {/* Event Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <div className="text-[#E15859] font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                      <CalendarIcon size={12} />
                      {group.booking.date}
                    </div>
                    <div className="text-[#404243] font-bold text-base mt-0.5 line-clamp-1">
                      {group.booking.restaurant}
                    </div>
                  </div>
                  <div className="text-[#8E8E93] text-[11px] font-bold bg-white px-2 py-1 rounded-lg border border-gray-100 flex items-center gap-1">
                    <MapPin size={10} />
                    {group.booking.city}
                  </div>
                </div>

                {/* Contacts in this Event */}
                <div className="space-y-2">
                  {group.contacts.map((contact, contactIdx) => (
                    <div
                      key={contact.id || contactIdx}
                      className="bg-white rounded-3xl px-4 py-3.5 shadow-sm border border-white hover:border-[#E15859]/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {contact.photo ? (
                            <img
                              src={contact.photo}
                              alt={contact.name}
                              className="w-12 h-12 rounded-2xl object-cover"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{ backgroundColor: AVATAR_COLORS[contactIdx % AVATAR_COLORS.length] + '20' }}
                            >
                              <span className="font-bold text-sm" style={{ color: AVATAR_COLORS[contactIdx % AVATAR_COLORS.length] }}>
                                {getInitials(contact.name)}
                              </span>
                            </div>
                          )}
                          {contact.is_teammate && (
                            <div className="absolute -top-1.5 -right-1.5 bg-[#E15859] text-white p-1 rounded-full shadow-lg border-2 border-white">
                              <Users size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-[#2A2021] text-sm font-bold truncate leading-tight">
                              {contact.name || "Без имени"}
                            </h3>
                            {contact.is_teammate && (
                              <span className="text-[9px] font-black uppercase tracking-tighter text-[#E15859] bg-[#E15859]/10 px-1.5 py-0.5 rounded-md self-center">
                                Ваша команда
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 text-[11px] text-[#8E8E93] font-medium mt-1">
                            {contact.age && <span>{contact.age} лет</span>}
                            {contact.city && <span className="flex items-center gap-1 before:content-['•'] before:mr-1">{contact.city}</span>}
                          </div>
                        </div>

                        {/* Action Link */}
                        {contact.telegram && !contact.isSupport && (
                          <a
                            href={`https://t.me/${contact.telegram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-[#E15859]/5 hover:bg-[#E15859] rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 active:scale-95"
                          >
                            <MessageCircle className="text-[#E15859] group-hover:text-white transition-colors" size={18} />
                          </a>
                        )}
                        {contact.isSupport && (
                          <a
                            href={`https://t.me/${contact.telegram?.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#E15859] bg-[#E15859]/10 px-3 py-2 rounded-xl"
                          >
                            Помощь
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

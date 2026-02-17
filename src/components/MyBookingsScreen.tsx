"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, MapPin, Calendar, Clock } from "lucide-react";
import { getUserBookings, type Booking } from "@/lib/api";

interface MyBookingsScreenProps {
  city?: string;
  authToken?: string | null;
  onBack?: () => void;
}

export function MyBookingsScreen({ city = "Москва", authToken, onBack }: MyBookingsScreenProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBookings() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserBookings(0, authToken || undefined);
        if (isMounted) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Не удалось загрузить бронирования");
          console.error("Failed to load bookings:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [authToken]);

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
    } catch {
      return dateStr;
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: "#E8F5E9", text: "#2E7D32", label: "✅ Активное" },
      completed: { bg: "#F3E5F5", text: "#6A1B9A", label: "✓ Завершено" },
      cancelled: { bg: "#FFEBEE", text: "#C62828", label: "✕ Отменено" },
    };
    return statusMap[status] || statusMap.active;
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: "#FFF7EF" }}>
      <div className="flex-1 flex flex-col px-6 pt-8 pb-32">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="text-[#E15859]" size={24} />
          </button>
          <h2
            className="text-[#E15859] text-[28px] font-black uppercase tracking-tight leading-none"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Мои бронирования
          </h2>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#8E8E93] text-[16px]">Загрузка...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#E15859] text-[16px]">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#8E8E93] text-[16px]">У вас нет бронирований</p>
              <p className="text-[#8E8E93] text-[14px] mt-2">Забронируйте мероприятие из афиши</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {bookings.map((booking) => {
              const statusInfo = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-[20px] overflow-hidden shadow-sm"
                >
                  {/* Card Header */}
                  <div className="px-6 pt-5 pb-4">
                    {/* Title and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-[#2A2021] text-[18px] font-bold">
                          Бронирование #{booking.id}
                        </h3>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap ml-2"
                        style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                      >
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-[#E15859]" size={18} />
                        <div>
                          <p className="text-[#2A2021] text-[15px] font-semibold">
                            {formatDate(booking.date)}
                          </p>
                          <p className="text-[#8E8E93] text-[13px]">Дата встречи</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="text-[#E15859]" size={18} />
                        <div>
                          <p className="text-[#2A2021] text-[15px] font-semibold">
                            {booking.time}
                          </p>
                          <p className="text-[#8E8E93] text-[13px]">Время встречи</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="text-[#E15859]" size={18} />
                        <div>
                          <p className="text-[#2A2021] text-[15px] font-semibold">
                            {booking.restaurant}
                          </p>
                          <p className="text-[#8E8E93] text-[13px]">{booking.city}</p>
                        </div>
                      </div>
                    </div>

                    {/* Participants Info */}
                    {booking.max_people && booking.current_bookings !== undefined && (
                      <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
                        <p className="text-[#8E8E93] text-[13px]">
                          Участников: {booking.current_bookings}/{booking.max_people}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#F0F0F0]">
                    <p className="text-[#8E8E93] text-[12px] text-center">
                      Дата бронирования:{" "}
                      {new Date(booking.booking_date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        {!isLoading && bookings.length > 0 && (
          <button
            onClick={onBack}
            className="w-full py-5 rounded-[20px] bg-[#E15859] text-white text-[17px] font-semibold mt-6"
          >
            Назад в профиль
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarScreenProps {
  onNext: (date: Date) => void;
  onBack: () => void;
  progress: number;
}

export function CalendarScreen({ onNext, onBack, progress }: CalendarScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

    const calendarDays = [];
    for (let i = 0; i < emptyDays; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate?.getDate() === day && 
                         selectedDate?.getMonth() === currentDate.getMonth() && 
                         selectedDate?.getFullYear() === currentDate.getFullYear();
      
      calendarDays.push(
        <button
          key={day}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`h-10 w-10 flex items-center justify-center rounded-full transition-all text-[16px] ${
            isSelected ? "bg-[#E15859] text-white" : "text-[#2A2021] hover:bg-[#E15859]/10"
          }`}
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {day}
        </button>
      );
    }

    return calendarDays;
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Progress Bar */}
      <div className="px-6 pt-16 pb-12">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: "#C8CACB" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ backgroundColor: "#404243", width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Title */}
      <div className="flex-1 px-6">
        <div className="mb-10 text-center">
          <h2
            className="text-[32px] font-black leading-tight uppercase tracking-tight mb-8"
            style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
          >
            ВЫБЕРИ ДАТУ
          </h2>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm mx-auto max-w-sm">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handlePrevMonth} className="p-2">
              <ChevronLeft size={24} style={{ color: "#707579" }} />
            </button>
            <h3 className="text-[18px] font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: "#2A2021" }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={handleNextMonth} className="p-2">
              <ChevronRight size={24} style={{ color: "#707579" }} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
            {days.map(day => (
              <div key={day} className="text-[14px] font-medium text-[#707579]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center">
            {renderDays()}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between px-10 pb-12 gap-4">
        <button
          onClick={onBack}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[1.5px] transition-colors"
          style={{ borderColor: "#E15859" }}
        >
          <ChevronLeft size={32} style={{ color: "#E15859" }} />
        </button>

        <button
          onClick={() => selectedDate && onNext(selectedDate)}
          disabled={!selectedDate}
          className="h-[72px] flex-1 rounded-full text-[20px] font-medium transition-all"
          style={{
            backgroundColor: !selectedDate ? "rgba(225, 88, 89, 0.3)" : "#E15859",
            color: "white",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}

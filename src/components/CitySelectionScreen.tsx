"use client";

import { useState } from "react";
import { MapPin, Settings } from "lucide-react";

interface CitySelectionScreenProps {
  onNext: (city: string) => void;
  progress: number;
}

export type City = "spb" | "dubai" | "moscow";

export function CitySelectionScreen({ onNext, progress }: CitySelectionScreenProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const cities = [
    { id: "spb" as City, name: "г. Санкт-Петербург" },
    { id: "dubai" as City, name: "Дубай" },
  ];

  const handleContinue = () => {
    if (selectedCity) {
      const cityName = cities.find(c => c.id === selectedCity)?.name || "";
      onNext(cityName);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#E9E9E9" }}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 pt-12 shrink-0">
        <div className="flex items-center gap-2 bg-[#F3B7B8] bg-opacity-30 rounded-full px-4 py-2">
          <MapPin size={18} className="text-[#E15859]" />
          <span 
            className="text-[14px] font-medium text-[#404243] opacity-60"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            г. Москва
          </span>
        </div>
        <div className="w-[44px] h-[44px] rounded-full bg-[#F3B7B8] bg-opacity-30 flex items-center justify-center">
          <Settings size={20} className="text-[#E15859]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4 relative">
        {/* Dinner Image & Overlay */}
        <div className="w-full h-[240px] rounded-[40px] overflow-hidden relative shadow-sm mb-6">
          <img 
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2074&auto=format&fit=crop" 
            alt="Dinner" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-white/20" />
        </div>

        {/* Text Labels */}
        <div className="text-center mb-8">
          <h2 
            className="text-[32px] font-black uppercase tracking-tight text-[#404243] opacity-30 mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            БРОНИРОВАНИЕ УЖИНА
          </h2>
          <div 
            className="flex items-center justify-center gap-4 text-[14px] text-[#404243] opacity-30 font-medium"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span>7 января</span>
            <span>Понедельник</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] italic">L</span>
              <span>18:00</span>
            </div>
          </div>
        </div>

        {/* City Selection Card */}
        <div 
          className="w-full rounded-[40px] bg-white p-8 shadow-sm flex flex-col items-center animate-in slide-in-from-bottom duration-500"
          style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', width: 'auto' }}
        >
          <h3 
            className="text-[28px] font-black uppercase tracking-tight text-[#E15859] mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            ВЫБЕРИ ГОРОД
          </h3>

          <div className="w-full space-y-3 mb-8">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className="w-full h-[56px] rounded-full border-[1.5px] px-4 flex items-center gap-3 transition-all active:scale-[0.98]"
                style={{ 
                  borderColor: "#E15859",
                  backgroundColor: selectedCity === city.id ? "#E15859" : "transparent"
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedCity === city.id ? "white" : "#F3B7B8", opacity: selectedCity === city.id ? 1 : 0.3 }}
                >
                  <MapPin size={16} style={{ color: selectedCity === city.id ? "#E15859" : "white" }} />
                </div>
                <span 
                  className="text-[18px] font-medium"
                  style={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: selectedCity === city.id ? "white" : "#404243"
                  }}
                >
                  {city.name}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="h-[64px] w-full rounded-full text-[18px] font-bold transition-all active:scale-[0.98]"
            style={{
              backgroundColor: !selectedCity ? "rgba(225, 88, 89, 0.3)" : "#E15859",
              color: "white",
              fontFamily: "'Montserrat', sans-serif",
            }}
            disabled={!selectedCity}
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}

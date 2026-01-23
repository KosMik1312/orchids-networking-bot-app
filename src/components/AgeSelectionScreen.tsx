"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

interface AgeSelectionScreenProps {
  onNext: (age: number) => void;
  onBack: () => void;
  progress: number;
}

export function AgeSelectionScreen({ onNext, onBack, progress }: AgeSelectionScreenProps) {
  const [selectedAge, setSelectedAge] = useState(25);
  const ages = Array.from({ length: 83 }, (_, i) => i + 18); // 18 to 100
  const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        const index = ages.indexOf(selectedAge);
        const itemHeight = 60;
        scrollRef.current.scrollTop = index * itemHeight;
      }
    }, []);

    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        const itemHeight = 60;
        const centerIndex = Math.round(scrollTop / itemHeight);
        if (ages[centerIndex]) {
          setSelectedAge(ages[centerIndex]);
        }
      }
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
      <div className="flex-1 flex flex-col items-center">
        <h2
          className="text-[32px] font-black leading-tight uppercase tracking-tight mb-8"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#E15859" }}
        >
          СКОЛЬКО ТЕБЕ ЛЕТ?
        </h2>

        {/* Age Picker */}
        <div className="relative h-[300px] w-full max-w-[200px] overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 h-[60px] -translate-y-1/2 pointer-events-none">
             <div className="h-[2px] w-full bg-[#404243]" style={{ position: 'absolute', top: 0 }}></div>
             <div className="h-[2px] w-full bg-[#404243]" style={{ position: 'absolute', bottom: 0 }}></div>
          </div>
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scrollbar-hide flex flex-col items-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y' }}
            >
            <div className="py-[120px] w-full"> {/* Padding to allow centering of first/last items */}
              {ages.map((age) => (
                <div
                  key={age}
                  className={`h-[60px] flex items-center justify-center text-[48px] snap-center transition-all duration-200 ${
                    selectedAge === age ? "text-[#2A2021] font-bold scale-110" : "text-[#707579]/40"
                  }`}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {age}
                </div>
              ))}
            </div>
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
          onClick={() => onNext(selectedAge)}
          className="h-[72px] flex-1 rounded-full text-[20px] font-medium transition-all"
          style={{
            backgroundColor: "#E15859",
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

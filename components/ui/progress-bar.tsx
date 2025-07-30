"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start progress immediately
    setProgress(10);

    // Gradually increase progress
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(50), 200);
    const timer3 = setTimeout(() => setProgress(70), 400);
    const timer4 = setTimeout(() => setProgress(90), 600);
    const timer5 = setTimeout(() => setProgress(100), 800);
    
    // Fade out after completion
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-[3px] z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="h-full transition-all duration-500 ease-out shadow-sm"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, #14b8a6 0%, #5eead4 100%)`,
          boxShadow: '0 0 10px 1px rgba(94, 234, 212, 0.5)',
        }}
      />
    </div>
  );
}
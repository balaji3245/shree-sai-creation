"use client";

import React from "react";
import { Bot } from "lucide-react";

export const FloatingAssistant = () => {
  return (
    <button
      onClick={() => console.log("Open Assistant (Backend integration pending)")}
      className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#C5A880] text-[#0a0a0a] rounded-full shadow-lg hover:scale-110 hover:shadow-xl hover:shadow-[#C5A880]/30 transition-all duration-300 animate-fade-up delay-100"
      aria-label="Open AI Assistant"
    >
      <Bot size={28} strokeWidth={1.5} />
    </button>
  );
};

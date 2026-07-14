"use client";

import React, { useState } from "react";
import { X, Send } from "lucide-react";

const AiIcon = ({ size = 28, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z"
      fill="currentColor"
    />
  </svg>
);

export const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! Welcome to Shree Sai Creation. How can I assist you with our luxury lighting collection today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");

    // Simulate bot typing...
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", text: "I'm a virtual assistant. My backend logic is currently being set up by the team!" }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-[60] w-[340px] h-[450px] max-h-[70vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#0f0f0f] border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                <AiIcon size={16} />
              </div>
              <h3 className="text-xs uppercase tracking-widest text-white font-semibold">AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] text-[11px] leading-relaxed tracking-wide p-3 rounded-xl ${
                  msg.role === "user" 
                    ? "bg-white text-black rounded-tr-none" 
                    : "bg-[#161616] border border-white/5 text-white/80 rounded-tl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-[#0a0a0a] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-[11px] tracking-wider text-white placeholder-white/20 px-4 py-2.5 border border-white/10 rounded-full focus:outline-none focus:border-white/40 transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              <Send size={14} className="ml-1" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 bg-white text-black rounded-full shadow-lg hover:scale-110 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 animate-fade-up delay-100"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={28} strokeWidth={1.5} /> : <AiIcon size={24} />}
      </button>
    </>
  );
};

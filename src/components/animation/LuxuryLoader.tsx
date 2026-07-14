"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LuxuryLoader: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader only once per session to avoid annoying users on subpage clicks
    const hasLoaded = sessionStorage.getItem("shree_sai_creation_loaded");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("shree_sai_creation_loaded", "true");
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070707] text-[#FAF8F5]"
        >
          {/* Subtle warm glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#C5A880] rounded-full blur-[140px] opacity-10 pointer-events-none" />

          {/* Animated Logo with Circular Ring */}
          <div className="relative mb-6 flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full"
            >
              {/* Outer Golden Geometric Ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                stroke="#C5A880"
                strokeWidth="1.5"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1, rotate: 270 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
            
            {/* Site Logo */}
            <motion.img 
              src="/logo.png" 
              alt="Shree Sai Creation Logo" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Brand Name & Tagline */}
          <div className="text-center overflow-hidden">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
              className="font-serif text-2xl tracking-[0.4em] uppercase text-white"
            >
              Shree Sai Creation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="mt-2 text-xs tracking-[0.25em] uppercase text-[#C9A96E]"
            >
              Premium Luxury Lighting
            </motion.p>
          </div>

          {/* Luxury loading line progress indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-white/10 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2.2, delay: 0.2, ease: "easeInOut" }}
              className="w-full h-full bg-[#C5A880]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

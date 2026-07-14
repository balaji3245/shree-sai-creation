"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Hammer, 
  Sparkles, 
  Truck, 
  Headphones, 
  Award, 
  Heart, 
  Eye, 
  Scale, 
  ArrowLeft, 
  ArrowRight as ArrowRightIcon 
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";

// ── Hero slides ──────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: "/landing-page/landing1.webp",
    eyebrow: "Illuminate Your World",
    headline: "TIMELESS ELEGANCE EXTRAORDINARY LIGHTING",
    sub: "Discover our premium collection of handcrafted chandeliers that blend luxury, innovation and timeless beauty.",
    cta1: { label: "EXPLORE COLLECTION", href: "/shop" },
    cta2: { label: "VIEW PROJECTS", href: "/shop" },
  },
  {
    image: "/landing-page/landing2.webp",
    eyebrow: "Sculpted Radiance",
    headline: "MAJESTIC GLASS ARTISTRY FOR GRAND SPACES",
    sub: "Precision-cut optical glass prisms designed to refract and capture the perfect golden hour glow.",
    cta1: { label: "EXPLORE COLLECTION", href: "/shop" },
    cta2: { label: "VIEW PROJECTS", href: "/shop" },
  },
  {
    image: "/landing-page/landing3.webp",
    eyebrow: "Bespoke Masterpieces",
    headline: "HAND-FORGED METALS DISTINCT SIGNATURE DETAILS",
    sub: "Each chandelier is individually sculpted by hand to reflect the unique character of your high-end residence.",
    cta1: { label: "EXPLORE COLLECTION", href: "/shop" },
    cta2: { label: "VIEW PROJECTS", href: "/shop" },
  }
];

// ── Categories ──────────────────────────────────────────────
const CATEGORIES = [
  { 
    name: "CHANDELIER", 
    count: 24, 
    img: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=600",
    slug: "Chandelier"
  },
  { 
    name: "INDOOR WALL LAMPS", 
    count: 20, 
    img: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?q=80&w=600",
    slug: "Indoor wall lamps"
  },
  { 
    name: "LINEAR LIGHTS", 
    count: 14, 
    img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600",
    slug: "Linear lights"
  },
  { 
    name: "CEILING LIGHTS", 
    count: 16, 
    img: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=600",
    slug: "Ceiling lights"
  },
  { 
    name: "INTERNAL PENDANT LIGHTS", 
    count: 18, 
    img: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=600",
    slug: "Internal pendant lights"
  },
  { 
    name: "OUTDOOR WALL LAMPS", 
    count: 12, 
    img: "https://images.unsplash.com/photo-1532007271951-c487760934ae?q=80&w=600",
    slug: "Outdoor wall lamps"
  }
];

export default function HomePage() {
  const { theme } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const categoryCarouselRef = useRef<HTMLDivElement>(null);

  // Auto-advance hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Filter out the 5 specific Shree Sai chandeliers for the Best Sellers carousel
  const bestSellers = PRODUCTS.filter(p => p.id.startsWith("prod_shreesai_"));

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const scrollLeftCategory = () => {
    if (categoryCarouselRef.current) {
      categoryCarouselRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRightCategory = () => {
    if (categoryCarouselRef.current) {
      categoryCarouselRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 overflow-x-hidden ${
      theme === "dark" ? "bg-[#060606] text-white" : "bg-[#FAF8F5] text-black"
    }`}>
      
      {/* ════════════════════════════════════════════════════════
          1. HERO SECTION WITH FLOATING RIGHT PANEL
      ════════════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {/* Slide backgrounds */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === currentSlide ? 1 : 0, zIndex: idx === currentSlide ? 10 : 0 }}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6500ms] ${
                idx === currentSlide ? "scale-[1.03]" : "scale-100"
              }`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            {/* Ambient Overlays */}
            <div className={`absolute inset-0 transition-colors duration-500 ${
              theme === "dark" ? "bg-black/55" : "bg-black/25"
            }`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            {/* Cursive script subtitle */}
            <p className="font-serif text-[#C9A96E] text-2xl sm:text-3xl italic tracking-wide mb-4 animate-fade-in">
              {HERO_SLIDES[currentSlide].eyebrow}
            </p>
            
            {/* Bold serif title */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-[0.05em] mb-6 max-w-xl">
              {HERO_SLIDES[currentSlide].headline}
            </h1>
            
            {/* Thin dividing line */}
            <div className="w-16 h-[1.5px] bg-[#C9A96E] mb-6" />

            {/* Description subtext */}
            <p className="text-[11px] sm:text-[12px] text-white/80 leading-[2] tracking-[0.15em] uppercase font-light max-w-md mb-10">
              {HERO_SLIDES[currentSlide].sub}
            </p>

            {/* Two Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href={HERO_SLIDES[currentSlide].cta1.href}
                className="w-full sm:w-auto bg-[#C9A96E] hover:bg-[#E8D5A3] text-black font-semibold text-[10px] tracking-[0.25em] px-8 py-4 transition-all duration-300 rounded-none shadow-lg shadow-black/30 text-center"
              >
                {HERO_SLIDES[currentSlide].cta1.label}
              </Link>
              <Link
                href={HERO_SLIDES[currentSlide].cta2.href}
                className="w-full sm:w-auto border border-white/60 hover:border-white text-white font-semibold text-[10px] tracking-[0.25em] px-8 py-4 transition-all duration-300 rounded-none text-center bg-white/5 backdrop-blur-sm"
              >
                {HERO_SLIDES[currentSlide].cta2.label}
              </Link>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-4 sm:left-6 lg:left-8 flex items-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-500 h-[2px] ${
                  i === currentSlide ? "w-8 bg-[#C9A96E]" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>


      </section>

      {/* ════════════════════════════════════════════════════════
          2. TOP TRUST BAR
      ════════════════════════════════════════════════════════ */}
      <section className={`border-y transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0d0d0d] border-white/5" : "bg-[#FAF8F5] border-black/5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/5 md:divide-black/5">
            {[
              { icon: <Truck size={20} className="text-[#C9A96E]" />, title: "FREE SHIPPING", sub: "Worldwide Order" },
              { icon: <Award size={20} className="text-[#C9A96E]" />, title: "PREMIUM QUALITY", sub: "Finest Materials" },
              { icon: <ShieldCheck size={20} className="text-[#C9A96E]" />, title: "SECURE PAYMENT", sub: "100% Secure" },
              { icon: <Headphones size={20} className="text-[#C9A96E]" />, title: "CUSTOMER SUPPORT", sub: "24/7 Support" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-4 py-2 first:pl-0 last:pr-0 justify-center md:justify-start">
                <div className="shrink-0">{item.icon}</div>
                <div>
                  <p className="text-[9.5px] tracking-[0.2em] uppercase font-bold">{item.title}</p>
                  <p className={`text-[8.5px] tracking-wide mt-0.5 ${
                    theme === "dark" ? "text-white/40" : "text-black/45"
                  }`}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. SHOP BY CATEGORY SECTION
      ════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="relative flex flex-col items-center mb-12 sm:mb-16">
          <div className="text-center space-y-3">
            <p className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#C9A96E] font-semibold">Our Collections</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide">Shop By Category</h2>
          </div>
          
          {/* Arrows */}
          <div className="flex items-center gap-3 mt-8 md:absolute md:right-0 md:bottom-2 md:mt-0">
            <button
              onClick={scrollLeftCategory}
              className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                theme === "dark"
                  ? "border-white/10 hover:border-white/30 text-white/55 hover:text-white hover:bg-white/5"
                  : "border-black/10 hover:border-black/30 text-black/55 hover:text-black hover:bg-black/5"
              }`}
              aria-label="Previous Categories"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={scrollRightCategory}
              className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                theme === "dark"
                  ? "border-white/10 hover:border-white/30 text-white/55 hover:text-white hover:bg-white/5"
                  : "border-black/10 hover:border-black/30 text-black/55 hover:text-black hover:bg-black/5"
              }`}
              aria-label="Next Categories"
            >
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>

        {/* Category Carousel Container */}
        <div 
          ref={categoryCarouselRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              href={`/shop?category=${cat.slug}`}
              className={`group flex flex-col overflow-hidden transition-all duration-500 w-[75vw] sm:w-[280px] lg:w-[300px] shrink-0 snap-start rounded-2xl border ${
                theme === "dark" 
                  ? "bg-[#0a0a0a] border-white/5 hover:border-[#C9A96E]/40" 
                  : "bg-white border-black/5 hover:border-[#C9A96E]/40 hover:shadow-xl hover:shadow-black/5"
              }`}
            >
              {/* Category Image (Top) */}
              <div className="p-3 sm:p-4 pb-0 w-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/5">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Text & Details (Bottom) */}
              <div className="p-4 sm:p-5 flex flex-col grow justify-between">
                <div>
                  <h3 className={`font-serif text-xl sm:text-2xl font-semibold tracking-wide transition-colors duration-300 group-hover:text-[#C9A96E] ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}>
                    {cat.name}
                  </h3>
                  <div className="w-8 h-[1px] bg-[#C9A96E] my-3 transform origin-left transition-transform duration-500 group-hover:scale-x-150" />
                  <p className={`text-[10px] tracking-[0.2em] uppercase ${
                    theme === "dark" ? "text-white/50" : "text-black/50"
                  }`}>
                    {cat.count} Products
                  </p>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[9px] tracking-widest uppercase font-medium transition-colors duration-300 group-hover:text-[#C9A96E] ${
                    theme === "dark" ? "text-white/40" : "text-black/40"
                  }`}>
                    Explore Collection
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:border-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-white ${
                    theme === "dark" ? "border-white/10 text-white/50" : "border-black/10 text-black/50"
                  }`}>
                    <ArrowRight size={13} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. BEST SELLERS SCROLLER SECTION
      ════════════════════════════════════════════════════════ */}
      <section className={`py-20 md:py-28 transition-colors duration-300 border-t ${
        theme === "dark" ? "bg-[#0b0b0b] border-white/5" : "bg-white border-black/5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
        {/* Header Row */}
        <div className="relative flex flex-col items-center mb-12 sm:mb-16">
          <div className="text-center space-y-3">
            <p className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#C9A96E] font-semibold">Featured Products</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide">Best Sellers</h2>
          </div>
          
          {/* Arrows */}
          <div className="flex items-center gap-3 mt-8 md:absolute md:right-0 md:bottom-2 md:mt-0">
            <button
              onClick={scrollLeft}
              className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                theme === "dark"
                  ? "border-white/10 hover:border-white/30 text-white/55 hover:text-white hover:bg-white/5"
                  : "border-black/10 hover:border-black/30 text-black/55 hover:text-black hover:bg-black/5"
              }`}
              aria-label="Previous Products"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                theme === "dark"
                  ? "border-white/10 hover:border-white/30 text-white/55 hover:text-white hover:bg-white/5"
                  : "border-black/10 hover:border-black/30 text-black/55 hover:text-black hover:bg-black/5"
              }`}
              aria-label="Next Products"
            >
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>

          {/* Horizontal Scroller container */}
          <div 
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {bestSellers.map(product => (
              <div key={product.id} className="w-[75vw] sm:w-[280px] lg:w-[300px] shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. LOWER TRUST BAR (BRAND PILLARS)
      ════════════════════════════════════════════════════════ */}
      <section className={`py-16 border-t transition-colors duration-300 ${
        theme === "dark" ? "bg-[#060606] border-white/5" : "bg-[#FAF8F5] border-black/5"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Hammer size={18} />,
                title: "EXPERT CRAFTSMANSHIP",
                desc: "Handcrafted by skilled artisans with precision."
              },
              {
                icon: <Sparkles size={18} />,
                title: "CUSTOM DESIGN",
                desc: "Personalized lighting solutions for your space."
              },
              {
                icon: <Award size={18} />,
                title: "LUXURY MATERIALS",
                desc: "Made with the finest materials worldwide."
              },
              {
                icon: <Star size={18} />,
                title: "TIMELESS DESIGN",
                desc: "Elegant designs that never go out of style."
              }
            ].map((pillar, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center text-center p-5 space-y-4 group"
              >
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  theme === "dark" 
                    ? "border-white/10 text-[#C9A96E] bg-white/3 group-hover:border-[#C9A96E]/50" 
                    : "border-black/10 text-[#C9A96E] bg-black/3 group-hover:border-[#C9A96E]/50"
                }`}>
                  {pillar.icon}
                </div>
                {/* Title */}
                <h3 className="text-[10px] tracking-[0.25em] font-bold uppercase">{pillar.title}</h3>
                {/* Description */}
                <p className={`text-[10.5px] leading-relaxed tracking-wider max-w-xs ${
                  theme === "dark" ? "text-white/40" : "text-black/45"
                }`}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

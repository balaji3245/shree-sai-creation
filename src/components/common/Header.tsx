"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Search, Menu, X, Trash2, Plus, Minus, ArrowRight, ArrowLeft, User, ChevronDown, LogOut, Package, Settings, CreditCard, Compass, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS, Product } from "@/data/products";
import { Logo } from "@/components/common/Logo";
import { getStoredProducts } from "@/utils/db";



// ─── Category previews for mega menu ─────────────────────────
const MEGA_CATEGORIES = [
  { name: "Chandelier", count: 24, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", slug: "Chandelier" },
  { name: "Indoor wall lamps", count: 20, img: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=300&q=80", slug: "Indoor wall lamps" },
  { name: "Linear lights", count: 12, img: "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?w=300&q=80", slug: "Linear lights" },
  { name: "Ceiling lights", count: 16, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&q=80", slug: "Ceiling lights" },
  { name: "Internal pendant lights", count: 18, img: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300&q=80", slug: "Internal pendant lights" },
  { name: "Outdoor wall lamps", count: 14, img: "https://images.unsplash.com/photo-1581428982868-e410dd187a90?w=300&q=80", slug: "Outdoor wall lamps" },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    cart, wishlist, isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen,
    removeFromCart, updateCartQuantity, toggleWishlist, addToCart,
    subtotal, theme, toggleTheme, formatPrice,
  } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    setProducts(getStoredProducts());
  }, [isSearchOpen]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  // Load user
  useEffect(() => {
    const stored = localStorage.getItem("shree_sai_user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [pathname]);

  // Search focus
  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const searchResults = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop", hasMega: true },
    { name: "Collections", href: "/collections" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("shree_sai_user");
    setUser(null);
    setIsProfileOpen(false);
    router.push("/");
  };

  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  if (isAuthPage) {
    return (
      <header
        className={`sticky top-0 left-0 w-full z-40 transition-all duration-500 border-b ${
          scrolled
            ? theme === "dark"
              ? "bg-[#0a0a0a]/95 backdrop-blur-md border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
              : "bg-white/95 backdrop-blur-md border-black/8 shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
            : theme === "dark"
              ? "bg-[#0a0a0a]/90 backdrop-blur-sm border-white/5"
              : "bg-[#FAF8F5]/90 backdrop-blur-sm border-black/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[85px]">
            {/* ─── Logo ─── */}
            <Link href="/" className="flex items-center select-none group py-1.5 shrink-0">
              <Logo iconSize={32} />
            </Link>

            {/* Theme Toggle Only */}
            <div className={`flex items-center ${theme === "dark" ? "text-white" : "text-black"}`}>
              <button
                onClick={toggleTheme}
                className="p-2 opacity-60 hover:opacity-100 hover:text-[#C9A96E] transition-all duration-200 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>


      {/* ─── Main Header ──────────────────────────────────────────── */}
      <header
        className={`sticky top-0 left-0 w-full z-40 transition-all duration-500 border-b ${
          scrolled
            ? theme === "dark"
              ? "bg-[#0a0a0a]/95 backdrop-blur-md border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
              : "bg-white/95 backdrop-blur-md border-black/8 shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
            : theme === "dark"
              ? "bg-[#0a0a0a]/90 backdrop-blur-sm border-white/5"
              : "bg-[#FAF8F5]/90 backdrop-blur-sm border-black/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[85px]">

            {/* Mobile Menu Toggle */}
            {pathname !== "/admin" && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`md:hidden p-1.5 transition-colors ${
                  theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
                }`}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}

            {/* ─── Logo ─── */}
            <Link href="/" className="flex items-center select-none group py-1.5 shrink-0">
              <Logo iconSize={32} />
            </Link>

            {/* ─── Desktop Navigation ─── */}
            {pathname !== "/admin" ? (
              <nav className="hidden md:flex items-center h-full mx-6" onMouseLeave={() => setHoveredNav(null)}>
                {navLinks.map(link => (
                  <div key={link.name} className="relative h-full flex items-center">
                    <Link
                      href={link.href}
                      onMouseEnter={() => link.hasMega ? setHoveredNav("shop") : setHoveredNav(null)}
                      className={`px-4 lg:px-5 h-full flex items-center text-[10px] tracking-[0.25em] uppercase font-semibold transition-colors duration-200 group ${
                        pathname === link.href
                          ? "text-[#C9A96E]"
                          : theme === "dark"
                            ? "text-white/70 hover:text-white"
                            : "text-black/70 hover:text-black"
                      }`}
                    >
                      <span className="relative py-1">
                        {link.name}
                        {/* Active underline */}
                        <span className={`absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C9A96E] transition-transform duration-300 origin-left ${
                          pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`} />
                      </span>
                      {link.hasMega && <ChevronDown size={10} className="ml-1 opacity-50" />}
                    </Link>
                  </div>
                ))}
              </nav>
            ) : (
              <nav className="hidden md:flex items-center h-full mx-6">
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-[9px] tracking-[0.25em] uppercase font-semibold transition-all duration-300 ${
                    theme === "dark" 
                      ? "border-white/20 text-white/80 hover:bg-white hover:text-black hover:scale-105" 
                      : "border-black/20 text-black/80 hover:bg-black hover:text-white hover:scale-105"
                  }`}
                >
                  <ArrowLeft size={12} />
                  Back to Site
                </Link>
              </nav>
            )}

            {/* ─── Right Actions ─── */}
            <div className={`flex items-center gap-1.5 ${theme === "dark" ? "text-white" : "text-black"}`}>

              {/* Search */}
              {pathname !== "/admin" && (
                <div className="relative flex items-center">
                  <div 
                    className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
                      isSearchOpen ? 'w-48 opacity-100 mr-2 border-b' : 'w-0 opacity-0 border-transparent'
                    } ${theme === "dark" ? "border-white/30" : "border-black/30"}`}
                  >
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className={`w-full bg-transparent text-[10px] tracking-wider outline-none py-1.5 placeholder:opacity-50 ${
                        theme === "dark" ? "text-white" : "text-black"
                      }`}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="ml-1 p-1 opacity-50 hover:opacity-100">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (isSearchOpen && !searchQuery) {
                        setIsSearchOpen(false);
                      } else {
                        setIsSearchOpen(true);
                      }
                    }}
                    className="p-2 opacity-60 hover:opacity-100 hover:text-[#C9A96E] transition-all duration-200"
                    aria-label="Search"
                  >
                    <Search size={16} />
                  </button>

                  {/* Inline Search Results Dropdown */}
                  <AnimatePresence>
                    {isSearchOpen && searchQuery && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 top-full mt-3 w-72 border shadow-2xl z-50 rounded-xl overflow-hidden max-h-96 overflow-y-auto ${
                          theme === "dark" 
                            ? "bg-[#0d0d0d] border-white/10 text-white shadow-black/80" 
                            : "bg-white border-black/10 text-black shadow-black/5"
                        }`}
                      >
                        {searchResults.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {searchResults.map(p => (
                              <Link
                                key={p.id}
                                href={`/shop/${p.slug}`}
                                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                className={`flex items-center gap-3 p-2 rounded-md transition-colors group ${
                                  theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
                                }`}
                              >
                                <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded opacity-80 group-hover:opacity-100" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold truncate group-hover:text-[#C9A96E] transition-colors">{p.name}</p>
                                  <p className={`text-[9px] ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>{p.category} · {formatPrice(p.price)}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center">
                            <p className={`text-[10px] tracking-wider uppercase ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>
                              No results for &quot;{searchQuery}&quot;
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 opacity-60 hover:opacity-100 hover:text-[#C9A96E] transition-all duration-200 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>

              {/* Cart */}
              {pathname !== "/admin" && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 opacity-60 hover:opacity-100 hover:text-[#C9A96E] transition-all duration-200"
                  aria-label="Cart"
                >
                  <ShoppingCart size={16} />
                  {totalCartItems > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#C9A96E] text-[7.5px] text-black font-bold flex items-center justify-center rounded-full">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              )}

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(v => !v)}
                  className="p-2 opacity-60 hover:opacity-100 hover:text-[#C9A96E] transition-all duration-200"
                  aria-label="Account"
                >
                  <User size={16} />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 top-full mt-3 w-64 border shadow-2xl z-50 rounded-xl overflow-hidden ${
                        theme === "dark" 
                          ? "bg-[#0d0d0d] border-white/10 text-white shadow-black/80" 
                          : "bg-white border-black/10 text-black shadow-black/5"
                      }`}
                    >
                      {user ? (
                        <div className="flex flex-col">
                          {/* User Header Info Card */}
                          <div className={`p-4 flex items-center gap-3 border-b relative ${
                            theme === "dark" ? "bg-white/3 border-white/5" : "bg-black/2 border-black/5"
                          }`}>
                            {/* Close button */}
                            <button 
                              onClick={() => setIsProfileOpen(false)}
                              className="absolute top-2.5 right-2.5 p-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                              aria-label="Close profile menu"
                            >
                              <X size={12} />
                            </button>

                            <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center font-serif text-sm font-semibold text-[#C9A96E] shrink-0">
                              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold tracking-wide truncate">{user.name}</p>
                              <p className={`text-[10px] truncate ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>{user.email}</p>
                              <span className="inline-block mt-1 text-[8px] font-bold tracking-widest uppercase bg-[#C9A96E]/15 border border-[#C9A96E]/20 text-[#C9A96E] px-1.5 py-0.5 rounded-sm">
                                {user.role} Member
                              </span>
                            </div>
                          </div>

                          {/* Quick Links Section */}
                          <div className={`p-2 space-y-0.5 border-b ${theme === "dark" ? "border-white/5" : "border-black/5"}`}>
                            <Link 
                              href="/account?tab=dashboard" 
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <User size={13} className="text-[#C9A96E]" />
                              My Dashboard
                            </Link>
                            <Link 
                              href="/account?tab=orders" 
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <Package size={13} className="text-[#C9A96E]" />
                              Order History
                            </Link>
                            <Link 
                              href="/account?tab=addresses" 
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <CreditCard size={13} className="text-[#C9A96E]" />
                              Billing & Addresses
                            </Link>
                          </div>

                          {/* Shopping Shortcuts (Wishlist & Cart) */}
                          <div className={`p-2 space-y-0.5 border-b ${theme === "dark" ? "border-white/5" : "border-black/5"}`}>
                            <button
                              onClick={() => { setIsWishlistOpen(true); setIsProfileOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <Heart size={13} className="text-[#C9A96E]" />
                                Wishlist
                              </span>
                              {wishlist.length > 0 && (
                                <span className="bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#C9A96E] text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                                  {wishlist.length} Items
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => { setIsCartOpen(true); setIsProfileOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <ShoppingCart size={13} className="text-[#C9A96E]" />
                                Shopping Bag
                              </span>
                              {totalCartItems > 0 && (
                                <span className="bg-[#C9A96E] text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                                  {totalCartItems} Items
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Settings & Sign Out */}
                          <div className="p-2 space-y-0.5">
                            <Link 
                              href="/account?tab=settings" 
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <Settings size={13} className="text-[#C9A96E]" />
                              Settings
                            </Link>
                            <button
                              onClick={handleLogout}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md text-left transition-colors ${
                                theme === "dark"
                                  ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/5"
                                  : "text-red-600/80 hover:text-red-600 hover:bg-red-500/5"
                              }`}
                            >
                              <LogOut size={13} /> 
                              Sign Out
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {/* Welcome Header */}
                          <div className={`p-4 border-b text-center relative ${
                            theme === "dark" ? "bg-white/3 border-white/5" : "bg-black/2 border-black/5"
                          }`}>
                            {/* Close button */}
                            <button 
                              onClick={() => setIsProfileOpen(false)}
                              className="absolute top-2.5 right-2.5 p-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                              aria-label="Close profile menu"
                            >
                              <X size={12} />
                            </button>

                            <p className="text-[10px] font-bold tracking-widest uppercase text-[#C9A96E] mb-1">Welcome to Shree Sai</p>
                            <p className={`text-[9px] leading-relaxed ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                              Login to unlock premium custom ordering & tracking details.
                            </p>
                          </div>

                          {/* Primary Actions */}
                          <div className="p-3 space-y-2">
                            <Link 
                              href="/signin" 
                              onClick={() => setIsProfileOpen(false)} 
                              className="block w-full text-center bg-[#C9A96E] hover:bg-[#E8D5A3] text-black font-semibold text-[9px] tracking-[0.25em] py-2.5 transition-colors uppercase"
                            >
                              Sign In
                            </Link>
                            <Link 
                              href="/signup" 
                              onClick={() => setIsProfileOpen(false)} 
                              className={`block w-full text-center border font-semibold text-[9px] tracking-[0.25em] py-2.5 transition-colors uppercase ${
                                theme === "dark"
                                  ? "border-white/10 hover:border-white text-white bg-white/3"
                                  : "border-black/10 hover:border-black text-black bg-black/3"
                              }`}
                            >
                              Create Account
                            </Link>
                          </div>

                          {/* Helper Links */}
                          <div className={`p-2 border-t space-y-0.5 ${theme === "dark" ? "border-white/5" : "border-black/5"}`}>
                            <Link 
                              href="/account?tab=orders" 
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <Package size={13} className="text-[#C9A96E]/70" />
                              Track Order
                            </Link>
                            <Link 
                              href="/about" 
                              onClick={() => setIsProfileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 text-[10px] tracking-wider uppercase rounded-md transition-colors ${
                                theme === "dark" ? "text-white/60 hover:text-white hover:bg-white/3" : "text-black/60 hover:text-black hover:bg-black/3"
                              }`}
                            >
                              <Compass size={13} className="text-[#C9A96E]/70" />
                              About Custom Lighting
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>






            </div>
          </div>
        </div>

        {/* ─── Mega Menu ─── */}
        <AnimatePresence>
          {hoveredNav === "shop" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute left-0 w-full bg-[#111111] border-t border-b border-white/5 shadow-2xl z-30"
              onMouseEnter={() => setHoveredNav("shop")}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-5 gap-6">
                  <div className="col-span-1">
                    <p className="section-label mb-4">Collections</p>
                    <div className="space-y-2">
                      {["All Products", "New Arrivals", "Best Sellers", "Sale"].map(item => (
                        <Link
                          key={item}
                          href={item === "All Products" ? "/shop" : `/shop?filter=${item.toLowerCase().replace(" ", "-")}`}
                          className="block text-[10px] tracking-widest uppercase text-white/50 hover:text-[#C9A96E] transition-colors py-1"
                          onClick={() => setHoveredNav(null)}
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-4 grid grid-cols-6 gap-3">
                    {MEGA_CATEGORIES.map(cat => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setHoveredNav(null)}
                        className="group"
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-[#1a1a1a] mb-2 rounded-sm">
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                          />
                        </div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-white group-hover:text-[#C9A96E] transition-colors">{cat.name}</p>
                        <p className="text-[9px] text-white/30 mt-0.5">{cat.count} Products</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>



      {/* ─── Cart Drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111111] border-l border-white/5 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-lg text-white tracking-wider">Your Cart</h2>
                  <p className="text-[10px] text-white/30 tracking-widest uppercase">{totalCartItems} {totalCartItems === 1 ? "item" : "items"}</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-white/40 hover:text-white transition-colors p-1.5"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <ShoppingCart size={32} className="text-white/10" />
                    <p className="text-white/30 text-sm">Your cart is empty</p>
                    <button onClick={() => { setIsCartOpen(false); router.push("/shop"); }} className="btn-luxury text-[10px] px-6 py-3">
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={`${item.product.id}-${item.selectedFinish}`} className="flex gap-4">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-24 object-cover flex-shrink-0 bg-[#1a1a1a]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] tracking-wider uppercase text-white leading-tight line-clamp-2">{item.product.name}</p>
                        <p className="text-[10px] text-white/30 mt-1">{item.selectedFinish}</p>
                        <p className="text-[#C9A96E] text-[11px] mt-1.5 font-medium">{formatPrice(item.product.price * (1 - item.product.discount / 100))}</p>
                        <div className="flex items-center gap-0 mt-2.5">
                          <button onClick={() => updateCartQuantity(item.product.id, item.selectedFinish, item.quantity - 1)} className="w-7 h-7 border border-white/10 text-white/50 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"><Minus size={10} /></button>
                          <span className="w-8 text-center text-[11px] text-white">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, item.selectedFinish, item.quantity + 1)} className="w-7 h-7 border border-white/10 text-white/50 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"><Plus size={10} /></button>
                          <button onClick={() => removeFromCart(item.product.id, item.selectedFinish)} className="ml-auto text-white/20 hover:text-red-400 transition-colors p-1"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-6 py-5 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-widest uppercase text-white/40">Subtotal</span>
                    <span className="font-serif text-white text-lg">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-[9px] text-white/25 tracking-wider">Shipping & taxes calculated at checkout</p>
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="btn-luxury w-full text-[10px] py-4">
                    Proceed to Checkout <ArrowRight size={13} />
                  </Link>
                  <button onClick={() => setIsCartOpen(false)} className="btn-outline-luxury w-full text-[10px] py-3.5">
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Wishlist Drawer ──────────────────────────────────────── */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setIsWishlistOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111111] border-l border-white/5 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-lg text-white tracking-wider">Wishlist</h2>
                  <p className="text-[10px] text-white/30 tracking-widest uppercase">{wishlist.length} saved items</p>
                </div>
                <button onClick={() => setIsWishlistOpen(false)} className="text-white/40 hover:text-white transition-colors p-1.5"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <Heart size={32} className="text-white/10" />
                    <p className="text-white/30 text-sm">No saved items yet</p>
                  </div>
                ) : (
                  wishlist.map(product => (
                    <div key={product.id} className="flex gap-4 border-b border-white/5 pb-4">
                      <Link href={`/shop/${product.slug}`} onClick={() => setIsWishlistOpen(false)}>
                        <img src={product.images[0]} alt={product.name} className="w-20 h-24 object-cover bg-[#1a1a1a]" />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/shop/${product.slug}`} onClick={() => setIsWishlistOpen(false)}>
                          <p className="text-[11px] tracking-wider uppercase text-white hover:text-[#C9A96E] transition-colors leading-tight">{product.name}</p>
                        </Link>
                        <p className="text-[#C9A96E] text-[11px] mt-1.5">{formatPrice(product.price)}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => { addToCart(product, 1, product.finish.split(",")[0]?.trim() || "Standard"); setIsWishlistOpen(false); setIsCartOpen(true); }}
                            className="btn-luxury text-[9px] px-3 py-2"
                          >
                            Add to Cart
                          </button>
                          <button onClick={() => toggleWishlist(product)} className="p-2 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 transition-colors">
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Mobile Menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-[#111111] border-r border-white/5 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                  <img src="/logo.webp" alt="Logo" className="w-8 h-8 object-contain" />
                  <div>
                    <p className="font-serif text-[11px] tracking-[0.35em] uppercase text-white">Shree Sai</p>
                    <p className="text-[7px] tracking-[0.45em] uppercase text-[#C9A96E]">Creation</p>
                  </div>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/40 hover:text-white transition-colors p-1.5"><X size={18} /></button>
              </div>

              <nav className="flex-1 px-6 py-8 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-3 text-[11px] tracking-[0.25em] uppercase border-b border-white/5 transition-colors ${
                      pathname === link.href ? "text-[#C9A96E]" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="px-6 py-6 border-t border-white/5 space-y-3">
                {user ? (
                  <div>
                    <p className="text-[10px] text-white/40 mb-2">{user.email}</p>
                    <button onClick={handleLogout} className="text-[10px] tracking-widest uppercase text-red-400/70">Sign Out</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)} className="btn-outline-luxury text-[10px] flex-1 py-3 text-center">Sign In</Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn-luxury text-[10px] flex-1 py-3 text-center">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

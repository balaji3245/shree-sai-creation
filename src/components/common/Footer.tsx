"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  if (pathname === "/signin" || pathname === "/signup" || pathname === "/admin") {
    return null;
  }

  return (
    <footer className="bg-[#070707] text-white/50 font-sans border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & Logo */}
          <div className="flex flex-col items-start space-y-6">
            <Link href="/" className="flex items-center select-none">
              <Logo iconSize={32} textColor="white" goldColor="#C9A96E" />
            </Link>
            <p className="text-[11px] leading-[2] tracking-wider text-white/40 max-w-sm">
              Shree Sai Creation brings luxury and elegance to your space with our exclusive collection of chandeliers and premium lighting.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                {
                  name: "Facebook",
                  href: "https://facebook.com",
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  )
                },
                {
                  name: "Instagram",
                  href: "https://instagram.com",
                  svg: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  )
                }
              ].map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#C9A96E] hover:border-[#C9A96E]/40 hover:scale-105 transition-all duration-200"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-[#C9A96E] font-semibold">Quick Links</h4>
            <ul className="space-y-3.5 text-[10.5px] uppercase tracking-[0.2em]">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
                { name: "Shipping Policy", href: "/terms" },
                { name: "Return Policy", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms & Conditions", href: "/terms" }
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/40 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-[#C9A96E] font-semibold">Customer Service</h4>
            <ul className="space-y-3.5 text-[10.5px] uppercase tracking-[0.2em]">
              {[
                { name: "FAQ", href: "/about" },
                { name: "Track Order", href: "/about" },
                { name: "My Account", href: "/signin" },
                { name: "Wishlist", href: "/wishlist" },
                { name: "Returns", href: "/terms" },
                { name: "Support", href: "/contact" }
              ].map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/40 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter Signup */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-[#C9A96E] font-semibold">Newsletter</h4>
            <p className="text-[11px] leading-[1.8] text-white/40 tracking-wider">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            {subscribed ? (
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] py-2">
                Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex bg-[#0d0d0d] border border-white/10 focus-within:border-[#C9A96E]/50 transition-colors duration-300">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-[10.5px] tracking-widest text-white placeholder-white/20 px-3 py-3 border-none focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-10 bg-[#C9A96E] text-black hover:bg-[#E8D5A3] flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  aria-label="Submit email"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            )}
            
            {/* Payment Icons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Visa */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center p-0.5 shadow-sm">
                <span className="text-[8px] font-bold text-[#1434CB] italic tracking-tight font-sans">VISA</span>
              </div>
              {/* Mastercard */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center p-0.5 shadow-sm gap-0.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90 -ml-2" />
              </div>
              {/* Stripe */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center p-0.5 shadow-sm">
                <span className="text-[8px] font-bold text-[#635BFF] font-sans tracking-tight">stripe</span>
              </div>
              {/* Paypal */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center p-0.5 shadow-sm">
                <span className="text-[8px] font-extrabold text-[#003087] italic tracking-tighter font-sans">PayPal</span>
              </div>
              {/* COD */}
              <div className="h-6 w-10 bg-white rounded flex items-center justify-center p-0.5 shadow-sm">
                <span className="text-[8px] font-bold text-black font-sans flex items-center">COD</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright strip */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/30">
            &copy; {new Date().getFullYear()} Shree Sai Creation. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

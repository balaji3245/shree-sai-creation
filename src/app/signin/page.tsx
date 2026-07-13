"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      if (email.toLowerCase() === "admin@shreesaicreation.com" && password === "admin123") {
        setSuccessMsg("Welcome back. Signing you in...");
        localStorage.setItem("shree_sai_user", JSON.stringify({ email, name: "Master Artisan", role: "admin" }));
        setTimeout(() => { router.push("/"); router.refresh(); }, 1500);
      } else if (password.length >= 6) {
        setSuccessMsg("Signed in successfully. Redirecting...");
        localStorage.setItem("shree_sai_user", JSON.stringify({ email, name: email.split("@")[0].toUpperCase(), role: "customer" }));
        setTimeout(() => { router.push("/"); router.refresh(); }, 1500);
      } else {
        setErrorMsg("Incorrect email or password. Please try again.");
      }
    }, 1500);
  };

  return (
    <div className="bg-[#0a0a0a] h-[calc(100vh-85px)] text-white flex items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-[#C9A96E] blur-[180px] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0d0d0d] border border-white/5 p-8 md:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[9px] tracking-[0.4em] uppercase text-[#C9A96E] font-medium block">
            House of Shree Sai Creation
          </span>
          <h1 className="font-serif text-2xl tracking-widest text-white">
            Sign In
          </h1>
          <div className="w-10 h-[1px] bg-[#C9A96E]/30 mx-auto mt-3" />
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="border border-red-500/20 bg-red-950/20 text-red-400 p-3 text-xs tracking-wide text-center rounded-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="border border-[#C9A96E]/30 bg-[#C9A96E]/5 text-[#C9A96E] p-3 text-xs tracking-wide text-center rounded-sm">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-white/20" size={14} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/8 text-white placeholder-white/20 p-3.5 pl-10 text-sm tracking-wide focus:border-[#C9A96E]/50 focus:outline-none transition-colors"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">Password *</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[9px] text-[#C9A96E] hover:text-white transition-colors tracking-wider"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-white/20" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/8 text-white placeholder-white/20 p-3.5 pl-10 pr-10 text-sm tracking-wide focus:border-[#C9A96E]/50 focus:outline-none transition-colors"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-white/30 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-white/40">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-[#C9A96E] cursor-pointer"
              />
              <span className="tracking-wider uppercase">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setErrorMsg("Password reset link sent to your email.")}
              className="hover:text-[#C9A96E] transition-colors tracking-wider uppercase"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="gold"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign In <ArrowRight size={14} />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            New to Shree Sai Creation?{" "}
            <Link
              href="/signup"
              className="text-[#C9A96E] hover:text-white transition-colors font-medium border-b border-[#C9A96E]/20 hover:border-white pb-0.5 ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
}

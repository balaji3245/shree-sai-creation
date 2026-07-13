"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Please accept the Terms & Conditions.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg("Account created successfully. Redirecting to sign in...");
      localStorage.setItem("shree_sai_registered_user", JSON.stringify({ name, email }));
      setTimeout(() => { router.push("/signin"); }, 1500);
    }, 1500);
  };

  const inputClass = "w-full bg-[#111] border border-white/8 text-white placeholder-white/20 p-3.5 pl-10 text-sm tracking-wide focus:border-[#C9A96E]/50 focus:outline-none transition-colors";

  return (
    <div className="bg-[#0a0a0a] h-[calc(100vh-85px)] text-white flex items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-[#C9A96E] blur-[180px] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0d0d0d] border border-white/5 p-8 md:p-10 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[9px] tracking-[0.4em] uppercase text-[#C9A96E] font-medium block">
            House of Shree Sai Creation
          </span>
          <h1 className="font-serif text-2xl tracking-widest text-white">
            Create Account
          </h1>
          <div className="w-10 h-[1px] bg-[#C9A96E]/30 mx-auto mt-3" />
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="border border-red-500/20 bg-red-950/20 text-red-400 p-3 text-xs tracking-wide text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="border border-[#C9A96E]/30 bg-[#C9A96E]/5 text-[#C9A96E] p-3 text-xs tracking-wide text-center">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-white/20" size={14} />
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-white/20" size={14} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-white/20" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                required
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-white/30 hover:text-white transition-colors" tabIndex={-1}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-white/20" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 text-[9px] text-white/40 leading-relaxed">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="accent-[#C9A96E] mt-0.5 cursor-pointer"
              required
            />
            <label htmlFor="agreeTerms" className="cursor-pointer select-none tracking-wider uppercase">
              I agree to the{" "}
              <Link href="/terms" className="text-[#C9A96E] hover:text-white transition-colors">Terms &amp; Conditions</Link>
              {" "}and{" "}
              <Link href="/privacy-policy" className="text-[#C9A96E] hover:text-white transition-colors">Privacy Policy</Link>
              .
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="gold" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Create Account <ArrowRight size={14} />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-[#C9A96E] hover:text-white transition-colors font-medium border-b border-[#C9A96E]/20 hover:border-white pb-0.5 ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
}

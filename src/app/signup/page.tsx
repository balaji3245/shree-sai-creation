"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
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

  const inputUnderlineClass = "w-full bg-transparent text-white placeholder-white/25 py-2.5 pl-8 text-sm tracking-wide focus:outline-none";

  return (
    <div className="min-h-[calc(100vh-85px)] bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      
      {/* Left Side: Form Panel */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-12 lg:p-16 xl:p-24 relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#0c0c0c]">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-[80%] h-[50%] rounded-full bg-[#C9A96E] blur-[150px] opacity-[0.02] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-up">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[9px] tracking-[0.45em] uppercase text-[#C9A96E] font-medium block">
              House of Shree Sai Creation
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl tracking-widest text-white leading-tight">
              Create Account
            </h1>
            <p className="text-xs text-white/40 tracking-wider">
              Join us to curate your custom premium lighting showroom.
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="border border-red-500/20 bg-red-950/10 text-red-400 p-4 text-xs tracking-wide text-center rounded-lg">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="border border-[#C9A96E]/20 bg-[#C9A96E]/5 text-[#C9A96E] p-4 text-xs tracking-wide text-center rounded-lg">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40">Full Name *</label>
              <div className="relative border-b border-white/10 focus-within:border-[#C9A96E] transition-colors py-1">
                <User className="absolute left-1 top-3.5 text-white/20" size={14} />
                <input
                  type="text"
                  placeholder="Artisan Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputUnderlineClass}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40">Email Address *</label>
              <div className="relative border-b border-white/10 focus-within:border-[#C9A96E] transition-colors py-1">
                <Mail className="absolute left-1 top-3.5 text-white/20" size={14} />
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputUnderlineClass}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40">Password *</label>
              <div className="relative border-b border-white/10 focus-within:border-[#C9A96E] transition-colors py-1">
                <Lock className="absolute left-1 top-3.5 text-white/20" size={14} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputUnderlineClass} pr-10`}
                  required
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-2.5 text-white/30 hover:text-white transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40">Confirm Password *</label>
              <div className="relative border-b border-white/10 focus-within:border-[#C9A96E] transition-colors py-1">
                <Lock className="absolute left-1 top-3.5 text-white/20" size={14} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputUnderlineClass}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 text-[9px] text-white/40 leading-relaxed pt-2">
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
                <Link href="/terms" className="text-[#C9A96E] hover:text-white transition-colors">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" className="text-[#C9A96E] hover:text-white transition-colors">Privacy Policy</Link>
                .
              </label>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="gold" className="w-full h-12 rounded-none tracking-[0.25em] text-xs uppercase" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 font-medium">
                    Create Account <ArrowRight size={14} />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-2">
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

      {/* Right Side: Visual Showcase Panel */}
      <div className="hidden md:block md:w-[55%] relative overflow-hidden bg-[#0d0d0d] min-h-[500px]">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?q=80&w=1200"
          alt="Luxury Lighting Showcase"
          className="absolute inset-0 w-full h-full object-cover select-none scale-105 hover:scale-100 transition-transform duration-[6s] cubic-bezier(0.16, 1, 0.3, 1)"
        />
        
        {/* Content on Image Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12 lg:p-20 text-[#faf8f5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-white/40" />
            <span className="text-[9px] tracking-[0.4em] uppercase text-white/60 font-serif">Est. 1998</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h2 className="font-serif text-4xl lg:text-5xl leading-tight tracking-wider text-white">
              Sculpting Light, <br />
              <span className="italic font-light text-white/80">Defining Spaces.</span>
            </h2>
            <p className="text-xs text-white/50 leading-[2] tracking-wider font-light">
              Experience the pinnacle of premium lighting design, where artisan craftsmanship meets architectural geometry. Handcrafted crystal, brushed brass, and timeless luxury.
            </p>
          </div>

          <div className="text-[9px] tracking-[0.3em] uppercase text-white/30">
            &copy; {new Date().getFullYear()} Shree Sai Creation
          </div>
        </div>
      </div>
    </div>
  );
}

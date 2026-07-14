"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="min-h-[calc(100vh-85px)] bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      
      {/* Left Side: Form Panel */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-12 lg:p-16 xl:p-24 relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#0c0c0c]">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-[80%] h-[50%] rounded-full bg-[#C9A96E] blur-[150px] opacity-[0.02] pointer-events-none" />

        <div className="w-full max-w-md space-y-10 relative z-10 animate-fade-up">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[9px] tracking-[0.45em] uppercase text-[#C9A96E] font-medium block">
              House of Shree Sai Creation
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl tracking-widest text-white leading-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-white/40 tracking-wider">
              Enter your credentials to access your luxury lighting workspace.
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40">Email Address *</label>
              <div className="relative border-b border-white/10 focus-within:border-[#C9A96E] transition-colors py-1">
                <Mail className="absolute left-1 top-3 text-white/20" size={14} />
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/25 py-2.5 pl-8 text-sm tracking-wide focus:outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-white/40">Password *</label>
              </div>
              <div className="relative border-b border-white/10 focus-within:border-[#C9A96E] transition-colors py-1">
                <Lock className="absolute left-1 top-3 text-white/20" size={14} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/25 py-2.5 pl-8 pr-10 text-sm tracking-wide focus:outline-none"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-2.5 text-white/30 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-white/40">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="accent-[#C9A96E] cursor-pointer w-3.5 h-3.5 rounded border-white/10"
                />
                <span className="tracking-wider uppercase group-hover:text-white/60 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setErrorMsg("Password reset link sent to your email.")}
                className="hover:text-[#C9A96E] transition-colors tracking-wider uppercase"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="gold"
                className="w-full h-12 rounded-none tracking-[0.25em] text-xs uppercase"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 font-medium">
                    Sign In <ArrowRight size={14} />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-2">
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

      {/* Right Side: Visual Showcase Panel */}
      <div className="hidden md:block md:w-[55%] relative overflow-hidden bg-[#0d0d0d] min-h-[500px]">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1200"
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

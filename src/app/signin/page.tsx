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
    <div className="min-h-[calc(100vh-85px)] md:h-[calc(100vh-85px)] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] flex flex-col md:flex-row font-sans md:overflow-hidden">
      
      {/* Left Side: Form Panel */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-10 lg:p-12 relative overflow-y-auto md:h-full bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--surface))] py-12">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-[80%] h-[50%] rounded-full bg-[rgb(var(--gold))] blur-[150px] opacity-[0.03] pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-up">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[9px] tracking-[0.45em] uppercase text-[rgb(var(--gold))] font-medium block">
              House of Shree Sai Creation
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl tracking-widest text-[rgb(var(--foreground))] leading-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-[rgb(var(--text-secondary))] tracking-wider">
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
            <div className="border border-[rgb(var(--gold))]/20 bg-[rgb(var(--gold))]/5 text-[rgb(var(--gold))] p-4 text-xs tracking-wide text-center rounded-lg">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-[rgb(var(--text-muted))]">Email Address *</label>
              <div className="relative border-b border-[rgb(var(--border))] focus-within:border-[rgb(var(--gold))] transition-colors py-1">
                <Mail className="absolute left-1 top-3 text-[rgb(var(--text-muted))]/40" size={14} />
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-[rgb(var(--foreground))] placeholder-[rgb(var(--text-muted))]/50 py-2.5 pl-8 text-sm tracking-wide focus:outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-semibold tracking-[0.3em] uppercase text-[rgb(var(--text-muted))]">Password *</label>
              </div>
              <div className="relative border-b border-[rgb(var(--border))] focus-within:border-[rgb(var(--gold))] transition-colors py-1">
                <Lock className="absolute left-1 top-3 text-[rgb(var(--text-muted))]/40" size={14} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[rgb(var(--foreground))] placeholder-[rgb(var(--text-muted))]/50 py-2.5 pl-8 pr-10 text-sm tracking-wide focus:outline-none"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-2.5 text-[rgb(var(--text-muted))]/60 hover:text-[rgb(var(--foreground))] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[rgb(var(--text-muted))]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="accent-[rgb(var(--gold))] cursor-pointer w-3.5 h-3.5 rounded border-[rgb(var(--border))]"
                />
                <span className="tracking-wider uppercase group-hover:text-[rgb(var(--text-secondary))] transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setErrorMsg("Password reset link sent to your email.")}
                className="hover:text-[rgb(var(--gold))] transition-colors tracking-wider uppercase"
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
            <p className="text-[10px] text-[rgb(var(--text-muted))] tracking-widest uppercase">
              New to Shree Sai Creation?{" "}
              <Link
                href="/signup"
                className="text-[rgb(var(--gold))] hover:text-[rgb(var(--foreground))] transition-colors font-medium border-b border-[rgb(var(--gold))]/20 hover:border-[rgb(var(--foreground))] pb-0.5 ml-1"
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

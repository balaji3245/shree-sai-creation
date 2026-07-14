"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { 
  User, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Eye,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// ── Mock Order Data ──────────────────────────────────────────
const MOCK_ORDERS = [
  {
    id: "SSC-2026-9812",
    date: "July 10, 2026",
    total: 4850,
    status: "In Production",
    items: [{ name: "Shree Sai Royale Chandelier", qty: 1, price: 4850 }],
    steps: [
      { label: "Order Placed", date: "July 10, 2026", done: true, current: true },
      { label: "Delivered", date: "Pending", done: false, current: false }
    ]
  },
  {
    id: "SSC-2026-8743",
    date: "June 24, 2026",
    total: 1250,
    status: "Delivered",
    items: [{ name: "Classic Alabaster Wall Sconce", qty: 2, price: 625 }],
    steps: [
      { label: "Order Placed", date: "June 24, 2026", done: true, current: false },
      { label: "Delivered", date: "June 30, 2026", done: true, current: true }
    ]
  }
];

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, formatPrice } = useCart();
  
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Track Order state
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackingResult, setTrackingResult] = useState<typeof MOCK_ORDERS[0] | null>(null);
  const [trackingError, setTrackingError] = useState("");

  // Address form state
  const [shippingAddress, setShippingAddress] = useState({
    street: "1024 Ocean Drive, Apt 4B",
    city: "Miami",
    state: "Florida",
    zip: "33139",
    phone: "+1 (305) 555-0199"
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Settings form state
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Site-specific preferences state
  const [preferredFinish, setPreferredFinish] = useState("Polished Brass");
  const [voltageStandard, setVoltageStandard] = useState("220V (EU/India)");
  const [lightSource, setLightSource] = useState("Warm LED (2700K)");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const stored = localStorage.getItem("shree_sai_user");
    if (!stored) {
      router.push("/signin");
    } else {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFullName(parsed.name || "");
      setEmailAddress(parsed.email || "");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("shree_sai_user");
    router.push("/");
    router.refresh();
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setTimeout(() => {
      setIsSavingAddress(false);
      alert("Addresses updated successfully!");
    }, 1000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !emailAddress) return;
    setIsSavingSettings(true);
    setTimeout(() => {
      const updatedUser = { ...user!, name: fullName, email: emailAddress };
      localStorage.setItem("shree_sai_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsSavingSettings(false);
      alert("Profile updated successfully!");
      // Dispatch custom storage event to update Header UI instantly
      window.dispatchEvent(new Event("storage"));
    }, 1000);
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");
    setTrackingResult(null);
    
    const cleanId = trackOrderId.trim().toUpperCase();
    if (!cleanId) return;

    const found = MOCK_ORDERS.find(o => o.id === cleanId);
    if (found) {
      setTrackingResult(found);
    } else {
      setTrackingError("No order found with ID '" + cleanId + "'. Try using 'SSC-2026-9812'");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-[#0a0a0a]" : "bg-[#FAF8F5]"}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Overview", icon: <User size={14} /> },
    { id: "orders", label: "My Orders & Tracking", icon: <Package size={14} /> },
    { id: "addresses", label: "Address Book", icon: <CreditCard size={14} /> },
    { id: "settings", label: "Account Settings", icon: <Settings size={14} /> },
  ];

  return (
    <div className={`w-full min-h-screen py-12 ${theme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-[#FAF8F5] text-black"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-10 text-center md:text-left">
          <p className="text-xs tracking-[0.35em] uppercase text-[#C9A96E] font-semibold mb-2">Member Portal</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide">My Account</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* ─── Sidebar Navigation ─── */}
          <div className={`p-5 border rounded-2xl ${
            theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
          }`}>
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/5">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center font-serif text-sm font-semibold text-[#C9A96E]">
                {user?.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-wide truncate">{user?.name}</p>
                <p className={`text-[10px] truncate ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-[10px] tracking-wider uppercase font-semibold transition-all rounded-lg text-left ${
                    activeTab === tab.id
                      ? "bg-[#C9A96E] text-black"
                      : theme === "dark"
                        ? "text-white/60 hover:text-white hover:bg-white/3"
                        : "text-black/60 hover:text-black hover:bg-black/3"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {tab.icon}
                    {tab.label}
                  </span>
                  <ChevronRight size={10} className={activeTab === tab.id ? "text-black" : "opacity-30"} />
                </button>
              ))}

              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] tracking-wider uppercase font-semibold text-left transition-colors rounded-lg mt-4 ${
                  theme === "dark"
                    ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/5"
                    : "text-red-600/80 hover:text-red-600 hover:bg-red-500/5"
                }`}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* ─── Tabs Area ─── */}
          <div className="lg:col-span-3">
            
            {/* ── TAB 1: DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${
                  theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
                }`}>
                  <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-3">Welcome back, {user?.name}!</h2>
                  <p className={`text-xs leading-relaxed max-w-xl ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                    Through your private portfolio dashboard, you can track custom chandelier builds, manage billing preferences, and speed up checkouts for all upcoming bespoke lighting commissions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className={`p-5 rounded-2xl border text-center ${
                    theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
                  }`}>
                    <Package className="mx-auto text-[#C9A96E] mb-3" size={24} />
                    <p className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold mb-1">Total Orders</p>
                    <h3 className="font-serif text-2xl font-semibold">2 Orders</h3>
                  </div>

                  <div className={`p-5 rounded-2xl border text-center ${
                    theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
                  }`}>
                    <MapPin className="mx-auto text-[#C9A96E] mb-3" size={24} />
                    <p className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold mb-1">Default Address</p>
                    <h3 className="text-xs font-semibold mt-1">Miami, Florida</h3>
                  </div>

                  <div className={`p-5 rounded-2xl border text-center ${
                    theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
                  }`}>
                    <ShieldCheck className="mx-auto text-[#C9A96E] mb-3" size={24} />
                    <p className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold mb-1">Level Status</p>
                    <h3 className="text-xs font-semibold uppercase mt-1 tracking-widest text-[#C9A96E]">{user?.role} member</h3>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: MY ORDERS ── */}
            {activeTab === "orders" && (
              <div className="space-y-8">
                
                {/* Track Order Input */}
                <div className={`p-6 rounded-2xl border ${
                  theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
                }`}>
                  <h3 className="font-serif text-lg font-semibold mb-4">Track Custom Chandelier Status</h3>
                  <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text"
                      placeholder="Enter Order ID (e.g. SSC-2026-9812)"
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      className={`flex-grow p-3 text-xs tracking-wider uppercase border focus:outline-none focus:border-[#C9A96E] ${
                        theme === "dark" 
                          ? "bg-black border-white/10 text-white placeholder-white/20" 
                          : "bg-[#f5f5f5] border-black/10 text-black placeholder-black/30"
                      }`}
                    />
                    <button 
                      type="submit" 
                      className="bg-[#C9A96E] hover:bg-[#E8D5A3] text-black font-semibold text-[10px] tracking-[0.25em] py-3.5 px-6 uppercase transition-all"
                    >
                      Track Now
                    </button>
                  </form>

                  {/* Tracking Results Output */}
                  {trackingResult && (
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-[9px] tracking-widest text-[#C9A96E] font-bold uppercase">Order Found</p>
                          <h4 className="font-serif text-lg font-semibold">{trackingResult.id}</h4>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>Status</p>
                          <span className="inline-block mt-0.5 text-[8px] font-bold tracking-widest uppercase bg-[#C9A96E]/15 border border-[#C9A96E]/20 text-[#C9A96E] px-2.5 py-1 rounded-sm">
                            {trackingResult.status}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Steps Tracker */}
                      <div className={`relative pl-6 space-y-6 border-l ml-3 py-2 ${
                        theme === "dark" ? "border-white/10" : "border-black/10"
                      }`}>
                        {trackingResult.steps.map((step, idx) => (
                          <div key={idx} className="relative">
                            {/* Bullet Circle marker */}
                            <div className={`absolute -left-[31px] w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                              step.done
                                ? "bg-[#C9A96E] border-[#C9A96E] text-black"
                                : theme === "dark" 
                                  ? "bg-black border-white/20 text-white/20" 
                                  : "bg-white border-black/20 text-black/20"
                            }`}>
                              {step.done ? <CheckCircle size={10} className="stroke-[2.5]" /> : <Clock size={10} />}
                            </div>

                            <div>
                              <p className={`text-[10px] font-bold tracking-wider uppercase ${
                                step.current 
                                  ? "text-[#C9A96E]" 
                                  : step.done 
                                    ? theme === "dark" ? "text-white" : "text-black"
                                    : theme === "dark" ? "text-white/30" : "text-black/30"
                              }`}>
                                {step.label}
                                {step.current && <span className="text-[8px] font-normal tracking-widest lowercase ml-2 opacity-50">(current phase)</span>}
                              </p>
                              <p className={`text-[9px] mt-0.5 ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>{step.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trackingError && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-xs tracking-wide">
                      <AlertCircle size={14} />
                      <span>{trackingError}</span>
                    </div>
                  )}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Past Custom Invoices</h3>
                  {MOCK_ORDERS.map(order => (
                    <div 
                      key={order.id}
                      className={`p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all ${
                        theme === "dark" ? "bg-[#0f0f0f] border-white/5 hover:border-white/10" : "bg-white border-black/5 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-sm">{order.id}</span>
                          <span className={`text-[7.5px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm ${
                            order.status === "Delivered" 
                              ? "bg-green-500/10 border border-green-500/20 text-green-400" 
                              : "bg-[#C9A96E]/15 border border-[#C9A96E]/20 text-[#C9A96E]"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-1.5 ${theme === "dark" ? "text-white/45" : "text-black/45"}`}>
                          Placed on: {order.date} • {order.items[0].name}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                        <div className="text-left md:text-right">
                          <p className={`text-[9px] ${theme === "dark" ? "text-white/30" : "text-black/35"}`}>Total Price</p>
                          <span className="font-semibold text-sm text-[#C9A96E]">{formatPrice(order.total)}</span>
                        </div>
                        <button
                          onClick={() => {
                            setTrackOrderId(order.id);
                            setTrackingResult(order);
                            setTrackingError("");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase border px-4 py-2 transition-all ${
                            theme === "dark" 
                              ? "border-white/10 hover:border-[#C9A96E] hover:text-[#C9A96E]" 
                              : "border-black/10 hover:border-[#C9A96E] hover:text-[#C9A96E]"
                          }`}
                        >
                          <Eye size={10} /> Track
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: ADDRESSES ── */}
            {activeTab === "addresses" && (
              <div className={`p-6 rounded-2xl border ${
                theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
              }`}>
                <h3 className="font-serif text-lg font-semibold mb-6">Address Preferences</h3>
                <form onSubmit={handleSaveAddress} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Street Address</label>
                      <input 
                        type="text" 
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                          theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">City</label>
                      <input 
                        type="text" 
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                          theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">State</label>
                      <input 
                        type="text" 
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                          theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">ZIP / Postal Code</label>
                      <input 
                        type="text" 
                        value={shippingAddress.zip}
                        onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                        className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                          theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Contact Number</label>
                      <input 
                        type="text" 
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                          theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSavingAddress}
                    className="bg-[#C9A96E] hover:bg-[#E8D5A3] disabled:opacity-50 text-black font-semibold text-[10px] tracking-[0.25em] py-3.5 px-8 uppercase transition-all"
                  >
                    {isSavingAddress ? "Saving Updates..." : "Save Address Book"}
                  </button>
                </form>
              </div>
            )}

            {/* ── TAB 4: SETTINGS ── */}
            {activeTab === "settings" && (
              <div className={`p-6 rounded-2xl border ${
                theme === "dark" ? "bg-[#0f0f0f] border-white/5" : "bg-white border-black/5"
              }`}>
                <h3 className="font-serif text-lg font-semibold mb-6">Account Settings</h3>
                <form onSubmit={handleSaveSettings} className="space-y-8">
                  
                  {/* Section 1: Profile Details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#C9A96E] border-b border-white/5 pb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Full Name</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                            theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                          }`}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Email Address</label>
                        <input 
                          type="email" 
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                            theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Lighting & Customization Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#C9A96E] border-b border-white/5 pb-2">Lighting & Customization Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Preferred Metal Finish</label>
                        <select 
                          value={preferredFinish}
                          onChange={(e) => setPreferredFinish(e.target.value)}
                          className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                            theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                          }`}
                        >
                          <option value="Polished Brass">Polished Brass</option>
                          <option value="Brushed Bronze">Brushed Bronze</option>
                          <option value="Polished Chrome">Polished Chrome</option>
                          <option value="Antique Alabaster">Antique Alabaster</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Voltage Standard</label>
                        <select 
                          value={voltageStandard}
                          onChange={(e) => setVoltageStandard(e.target.value)}
                          className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                            theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                          }`}
                        >
                          <option value="110V (US/Americas)">110V (US/Americas)</option>
                          <option value="220V (EU/India)">220V (EU/India)</option>
                          <option value="240V (UK/Oceania)">240V (UK/Oceania)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Light Source Temperature</label>
                        <select 
                          value={lightSource}
                          onChange={(e) => setLightSource(e.target.value)}
                          className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                            theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                          }`}
                        >
                          <option value="Amber Glow (2200K)">Amber Glow (2200K)</option>
                          <option value="Warm LED (2700K)">Warm LED (2700K)</option>
                          <option value="Neutral White (4000K)">Neutral White (4000K)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Localization & Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#C9A96E] border-b border-white/5 pb-2">Localization & Alerts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold tracking-widest text-[#C9A96E] uppercase">Default Currency</label>
                        <select 
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className={`w-full p-3 text-xs border focus:outline-none focus:border-[#C9A96E] ${
                            theme === "dark" ? "bg-black border-white/10 text-white" : "bg-[#f5f5f5] border-black/10 text-black"
                          }`}
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-center space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer text-xs">
                          <input 
                            type="checkbox" 
                            checked={emailAlerts}
                            onChange={(e) => setEmailAlerts(e.target.checked)}
                            className="accent-[#C9A96E] h-4 w-4"
                          />
                          <span className={theme === "dark" ? "text-white/70" : "text-black/70"}>Receive Build Updates via Email</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer text-xs">
                          <input 
                            type="checkbox" 
                            checked={smsAlerts}
                            onChange={(e) => setSmsAlerts(e.target.checked)}
                            className="accent-[#C9A96E] h-4 w-4"
                          />
                          <span className={theme === "dark" ? "text-white/70" : "text-black/70"}>Receive SMS Dispatch Alerts</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSavingSettings}
                    className="bg-[#C9A96E] hover:bg-[#E8D5A3] disabled:opacity-50 text-black font-semibold text-[10px] tracking-[0.25em] py-3.5 px-8 uppercase transition-all"
                  >
                    {isSavingSettings ? "Saving Settings..." : "Save Preferences"}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A96E]"></div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CreditCard, Landmark, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addOrder } from "@/utils/db";

export default function CheckoutPage() {
  const { cart, clearCart, subtotal, discountAmount, tax, shipping, total, formatPrice } = useCart();

  // Checkout phase: form -> success
  const [isCompleted, setIsCompleted] = useState(false);
  const [paymentMethod] = useState<"cod">("cod");
  const [orderNumber, setOrderNumber] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const storedUser = localStorage.getItem("shree_sai_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.token) {
            headers["Authorization"] = `Bearer ${parsed.token}`;
          }
        } catch (e) {
          console.error("Error parsing stored user token", e);
        }
      }
      const shippingAddress = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        line1: formData.address,
        line2: "",
        city: formData.city,
        state: formData.state,
        pincode: formData.zip,
        country: "IN"
      };

      // Build cart items payload
      const cartItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images?.[0] || "",
        unitPrice: Math.round(item.product.price * (1 - item.product.discount / 100)),
        quantity: item.quantity,
        selectedFinish: item.selectedFinish || "",
      }));

      const createRes = await fetch("/api/v1/checkout/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          shippingAddress,
          email: formData.email,
          phone: formData.phone,
          paymentMethod,
          cartItems,
          subtotal,
          discountAmount,
          tax,
          shipping,
          grandTotal: total,
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.message || "Failed to place order.");
      }

      setOrderNumber(createData.orderNumber);
      setIsCompleted(true);
      clearCart();
    } catch (err) {
      console.error("Checkout order placement error:", err);
      const message = err instanceof Error ? err.message : "Connection error. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimatedArrival = "AUGUST 24 - SEPTEMBER 02, 2026";

  if (isCompleted) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white font-sans flex items-center justify-center py-20">
        <div className="max-w-xl w-full mx-auto px-4 text-center space-y-8 bg-[#0d0d0d] border border-white/5 p-10 md:p-12 uppercase tracking-widest text-[10px] text-white/50">
          <div className="inline-flex p-4 bg-white/5 border border-[#C5A880] text-[#C5A880] rounded-full">
            <CheckCircle size={32} />
          </div>
          
          <div className="space-y-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880] font-medium block">
              Purchase Complete
            </span>
            <h1 className="font-serif text-2xl uppercase tracking-widest text-white">
              Order Confirmed
            </h1>
            <p className="max-w-xs mx-auto leading-relaxed font-light">
              Thank you for choosing Shree Sai Creation. Your transaction has processed, and your order receipt details have been sent electronically.
            </p>
          </div>

          {/* Receipt Specs */}
          <div className="border-t border-b border-white/5 py-6 space-y-3 text-left font-light">
            <p className="flex justify-between">
              <span className="text-white/40">Order Reference:</span>
              <span className="text-white font-medium">{orderNumber}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-white/40">Crating Period:</span>
              <span className="text-white font-medium">6 - 8 Weeks (Handcrafting)</span>
            </p>
            <p className="flex justify-between">
              <span className="text-white/40">Estimated Arrival:</span>
              <span className="text-white font-medium">{estimatedArrival}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-white/40">Carrier Arrangements:</span>
              <span className="text-[#C5A880] font-medium">Priority Air-Freight Crated</span>
            </p>
          </div>

          <div className="pt-2">
            <Button variant="gold" className="w-full">
              <Link href="/shop" className="w-full text-center">
                Return to Showroom
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#C5A880] font-medium block mb-2">
            Secure checkout
          </span>
          <h1 className="font-serif text-3xl uppercase tracking-widest text-white">
            Order Placement
          </h1>
          <div className="w-12 h-[1px] bg-[#C5A880]/30 mt-4" />
        </div>

        {cart.length > 0 ? (
          <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start uppercase tracking-widest text-[9px] text-white/50">
            
            {/* Left Forms column */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              
              {/* 1. Shipping form */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 md:p-8 space-y-6">
                <h3 className="font-serif text-xs text-white tracking-widest font-semibold border-b border-white/5 pb-3">
                  01. Crating Delivery Coordinates
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-medium">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-medium">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Telephone Coordinate *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-medium">Street Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                    placeholder="STREET NAME, SUITE, OR FOYER NUMBER"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block font-medium">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">State / Region *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium">Zip / Postal Code *</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method panel */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 md:p-8 space-y-6">
                <h3 className="font-serif text-xs text-white tracking-widest font-semibold border-b border-white/5 pb-3">
                  02. Payment Method
                </h3>
                
                {/* Single COD Option */}
                <div className="p-4 border border-[#C5A880] bg-[#C5A880]/5 rounded-none space-y-3 font-sans text-xs tracking-wider normal-case text-white/90 leading-relaxed">
                  <div className="flex items-center gap-3 text-[#C5A880]">
                    <ShieldCheck size={18} />
                    <span className="font-serif text-sm font-semibold uppercase tracking-widest text-[#C5A880]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="font-light text-white/70">
                    Pay safely upon delivery. No advance online payment required. Cash, UPI, or QR payment is accepted at your doorstep when your chandelier is delivered.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              
              {/* Verification items */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 space-y-4">
                <h4 className="font-serif text-xs text-white tracking-widest font-semibold pb-2 border-b border-white/5">
                  Order Review
                </h4>
                <div className="divide-y divide-white/5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedFinish}`}
                      className="py-3 flex gap-3 items-center justify-between"
                    >
                      <div className="flex gap-2 items-center">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-8 h-8 object-cover border border-white/5" />
                        <div>
                          <span className="text-white block font-sans truncate max-w-[120px]">{item.product.name}</span>
                          <span className="text-[8px] text-white/40 block">QTY: {item.quantity} &middot; {item.selectedFinish}</span>
                        </div>
                      </div>
                      <span className="text-white font-sans">
                        {formatPrice((item.product.price * (1 - item.product.discount / 100)) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 space-y-4 uppercase tracking-widest text-[10px]">
                <h4 className="font-serif text-xs text-white tracking-widest font-semibold pb-2 border-b border-white/5">
                  Cost Summary
                </h4>
                <div className="space-y-3 font-light text-white/60">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-sans">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#C5A880]">
                      <span>Discount</span>
                      <span className="font-sans">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Crating & Air shipping</span>
                    <span className="text-white font-sans">
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span className="text-white font-sans">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="font-serif text-xs text-white tracking-wider font-semibold">Total Cost</span>
                  <span className="text-sm text-[#C5A880] font-sans font-medium tracking-widest">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="pt-2 space-y-4">
                  {errorMessage && (
                    <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-400 font-sans text-xs tracking-wider normal-case text-center">
                      {errorMessage}
                    </div>
                  )}

                  <Button type="submit" variant="gold" className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting ? "PROCESSING TRANSACTION..." : "Submit Secure Order"}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[8px] text-white/30 tracking-widest uppercase">
                    <ShieldCheck size={11} className="text-[#C5A880]" />
                    <span>SECURE SSL 256-BIT ENCRYPTED GATEWAY</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        ) : (
          /* Empty checkout redirection */
          <div className="py-20 text-center space-y-6 bg-[#0d0d0d] border border-white/5 max-w-xl mx-auto">
            <p className="text-xs text-white/40 uppercase tracking-widest font-light">
              No items in bag to checkout
            </p>
            <Button variant="gold">
              <Link href="/shop">Go to Showroom</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

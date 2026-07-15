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
  const [paymentMethod, setPaymentMethod] = useState<"visa" | "mastercard" | "stripe" | "paypal" | "cod">("visa");
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

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrderNum = `AUR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(generatedOrderNum);

    const newOrder = {
      id: generatedOrderNum,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      phone: formData.phone,
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || ""
      })),
      subtotal,
      total,
    };

    // Simulate payment transaction delays
    setTimeout(() => {
      addOrder(newOrder);
      setIsCompleted(true);
      clearCart();
    }, 1200);
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
                  02. Transaction Method (Simulated)
                </h3>
                
                {/* Method Swatches */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { id: "visa", label: "Visa" },
                    { id: "mastercard", label: "Mastercard" },
                    { id: "stripe", label: "Stripe" },
                    { id: "paypal", label: "PayPal" },
                    { id: "cod", label: "COD" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as "visa" | "mastercard" | "stripe" | "paypal" | "cod")}
                      className={`p-3 border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-[9px] uppercase tracking-wider font-semibold ${
                        paymentMethod === method.id
                          ? "bg-[#C5A880]/5 border-[#C5A880] text-[#C5A880]"
                          : "bg-transparent border-white/10 text-white hover:border-white/20"
                      }`}
                    >
                      {method.id === "visa" || method.id === "mastercard" || method.id === "stripe" ? (
                        <CreditCard size={14} />
                      ) : method.id === "paypal" ? (
                        <span className="text-[9px] italic font-extrabold tracking-tighter">PayPal</span>
                      ) : (
                        <span className="text-[9px] font-bold">COD</span>
                      )}
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-Forms */}
                {(paymentMethod === "visa" || paymentMethod === "mastercard" || paymentMethod === "stripe") && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="block font-medium">Cardholder Name *</label>
                      <input
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 text-white p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                        required={paymentMethod === "visa" || paymentMethod === "mastercard" || paymentMethod === "stripe"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium">Card Number *</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full bg-[#111] border border-white/10 text-white p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                        placeholder="•••• •••• •••• ••••"
                        required={paymentMethod === "visa" || paymentMethod === "mastercard" || paymentMethod === "stripe"}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-medium">Expiry *</label>
                        <input
                          type="text"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 text-white p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                          placeholder="MM / YY"
                          required={paymentMethod === "visa" || paymentMethod === "mastercard" || paymentMethod === "stripe"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-medium">CVV *</label>
                        <input
                          type="text"
                          value={formData.cardCVV}
                          onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                          className="w-full bg-[#111] border border-white/10 text-white p-3 text-[9px] tracking-widest uppercase focus:border-white focus:outline-none"
                          placeholder="•••"
                          required={paymentMethod === "visa" || paymentMethod === "mastercard" || paymentMethod === "stripe"}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="p-4 border border-[#C5A880]/20 bg-white/5 space-y-3 font-sans text-xs tracking-wider normal-case text-white/80 leading-relaxed font-light">
                    <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold font-sans mb-1">
                      PayPal Checkout:
                    </p>
                    <p>You will be securely redirected to PayPal to complete your payment after clicking &quot;Place Order&quot;.</p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="p-4 border border-[#C5A880]/20 bg-white/5 space-y-3 font-sans text-xs tracking-wider normal-case text-white/80 leading-relaxed font-light">
                    <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold font-sans mb-1">
                      Cash on Delivery (COD):
                    </p>
                    <p>No upfront payment is required. You will pay in cash or via UPI/QR code at your doorstep upon delivery.</p>
                  </div>
                )}
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
                  <Button type="submit" variant="gold" className="w-full h-12">
                    Submit Secure Order
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

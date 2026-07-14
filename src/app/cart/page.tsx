"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    subtotal,
    discountAmount,
    tax,
    shipping,
    total,
    promoCode,
    applyPromoCode,
    formatPrice,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess(false);

    if (!promoInput) return;

    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoSuccess(true);
      setPromoInput("");
    } else {
      setPromoError("INVALID OR EXPIRED PROMOTIONAL CODE");
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#C5A880] font-medium block mb-2">
            Shopping Bag
          </span>
          <h1 className="font-serif text-3xl uppercase tracking-widest text-white">
            Your Selection
          </h1>
          <div className="w-12 h-[1px] bg-[#C5A880]/30 mt-4" />
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left Items Column */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="border border-white/5 bg-[#0d0d0d] divide-y divide-white/5">
                {cart.map((item) => {
                  const unitPrice = item.product.price * (1 - item.product.discount / 100);
                  return (
                    <div
                      key={`${item.product.id}-${item.selectedFinish}`}
                      className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        <Link href={`/shop/${item.product.slug}`} className="w-20 h-20 aspect-square overflow-hidden bg-[#161616] border border-white/5 flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div>
                          <Link
                            href={`/shop/${item.product.slug}`}
                            className="text-xs uppercase tracking-widest text-white hover:text-[#C5A880] transition-colors font-sans block"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-[10px] text-white/40 tracking-wider mt-1 uppercase">
                            Finish: {item.selectedFinish}
                          </p>
                          <p className="text-[10px] text-[#C5A880] tracking-wider mt-1 font-sans">
                            {formatPrice(unitPrice)} Each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-white/10 px-1 py-0.5 bg-black">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedFinish, item.quantity - 1)}
                            className="p-1 text-white/50 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-[10px] font-sans font-medium text-white select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedFinish, item.quantity + 1)}
                            className="p-1 text-white/50 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Total price & delete */}
                        <div className="flex items-center gap-6">
                           <span className="text-xs tracking-widest text-[#C5A880] font-sans font-medium">
                            {formatPrice(unitPrice * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedFinish)}
                            className="text-white/30 hover:text-white transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
              
              {/* Promo Code box */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 space-y-4 uppercase tracking-widest text-[9px] text-white/40">
                <h4 className="font-serif text-xs text-white tracking-widest font-semibold pb-2 border-b border-white/5">
                  Promotional Code
                </h4>
                <form onSubmit={handleApplyPromo} className="flex gap-2 border-b border-white/10 pb-2">
                  <input
                    type="text"
                    placeholder="ENTER CODE (E.G. WELCOME15)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-transparent text-[10px] tracking-widest uppercase text-white placeholder-white/20 border-none focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="text-[#C5A880] hover:text-white transition-colors font-sans font-medium text-[10px]"
                  >
                    Apply
                  </button>
                </form>
                {promoError && <p className="text-red-500 font-semibold">{promoError}</p>}
                {promoSuccess && <p className="text-[#C5A880] font-semibold">CODE APPLIED SUCCESSFULLY</p>}
                {promoCode && (
                  <div className="flex justify-between items-center bg-white/5 p-2 text-white/80 font-sans">
                    <span className="flex items-center gap-1">
                      <Percent size={11} className="text-[#C5A880]" />
                      ACTIVE: {promoCode}
                    </span>
                    <span className="text-[#C5A880]">Applied</span>
                  </div>
                )}
              </div>

              {/* Order calculations */}
              <div className="bg-[#0d0d0d] border border-white/5 p-6 space-y-5 uppercase tracking-widest text-[10px]">
                <h4 className="font-serif text-xs text-white tracking-widest font-semibold pb-2 border-b border-white/5">
                  Order Summary
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
                    <span>Crating & Shipping</span>
                    <span className="text-white font-sans">
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="text-white font-sans">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="font-serif text-xs text-white tracking-wider font-semibold">Total Cost</span>
                  <span className="text-sm text-[#C5A880] font-sans font-medium tracking-widest">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="pt-2">
                  <Button variant="gold" className="w-full h-12">
                    <Link href="/checkout" className="flex items-center justify-center gap-2 w-full">
                      Proceed to Checkout <ArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Empty cart state */
          <div className="py-24 text-center space-y-6 bg-[#0d0d0d] border border-white/5 max-w-xl mx-auto">
            <ShoppingCart size={48} className="text-white/20 mx-auto" />
            <p className="text-xs text-white/40 uppercase tracking-widest font-light">
              Your shopping selection is currently empty
            </p>
            <Button variant="gold">
              <Link href="/shop">Browse Showroom</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

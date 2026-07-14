"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Product } from "@/data/products";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist, addToCart, formatPrice, theme } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState(
    product.finish.split(",")[0]?.trim() || ""
  );

  const discountedPrice = product.price * (1 - product.discount / 100);
  const finishesList = product.finish.split(",").map(f => f.trim());
  const inWishlist = isInWishlist(product.id);

  return (
    <>
      <div className={`group flex flex-col overflow-hidden transition-all duration-500 rounded-2xl border ${
        theme === "dark"
          ? "bg-[#0a0a0a] border-white/5 hover:border-[#C9A96E]/40"
          : "bg-white border-black/5 hover:border-[#C9A96E]/40 hover:shadow-xl hover:shadow-black/5"
      }`}>

        {/* ── Image Container (Top) ── */}
        <div className="p-3 sm:p-4 pb-0 w-full">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/5">
            <Link href={`/shop/${product.slug}`} className="block w-full h-full">
              {/* Primary Image */}
              <img
                src={product.images[0]}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05] ${
                  product.images[1] ? "group-hover:opacity-0 opacity-100" : "opacity-100"
                }`}
              />
              {/* Secondary Image */}
              {product.images[1] && (
                <img
                  src={product.images[1]}
                  alt={`${product.name} alternate view`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-out opacity-0 scale-[1.05] group-hover:opacity-100 group-hover:scale-[1.05]"
                />
              )}
            </Link>

            {/* Staggered Floating Action Icons (Top-Right) */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                  inWishlist
                    ? "bg-[#C9A96E] border-[#C9A96E] text-black"
                    : "bg-black/40 border-white/10 text-white hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-black"
                }`}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={13} className={inWishlist ? "fill-black" : ""} />
              </button>

              {/* Quick View Button */}
              <button
                onClick={() => setIsQuickViewOpen(true)}
                className="w-8 h-8 rounded-full border border-white/10 bg-black/40 text-white hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-black flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                aria-label="Quick View"
              >
                <Eye size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Product Info (Bottom) ── */}
        <div className="p-4 sm:p-5 flex flex-col grow justify-between">
          <div>
            {/* Category */}
            <p className="text-[8px] tracking-[0.3em] uppercase text-[#C9A96E]/80 font-bold mb-2">{product.category}</p>
            
            {/* Product Title */}
            <Link
              href={`/shop/${product.slug}`}
              className={`font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-wide transition-colors duration-300 group-hover:text-[#C9A96E] line-clamp-2 leading-snug ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              {product.name}
            </Link>
            
            <div className="w-8 h-[1px] bg-[#C9A96E] my-3 transform origin-left transition-transform duration-500 group-hover:scale-x-150" />

            {/* Pricing Row with Discount Badge */}
            <div className="flex items-center flex-wrap gap-2.5">
              <span className={`text-sm tracking-wide ${theme === "dark" ? "text-[#C9A96E]" : "text-[#B5985E] font-bold"}`}>
                {formatPrice(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className={`text-[10px] line-through tracking-wide ${theme === "dark" ? "text-white/30" : "text-black/35"}`}>
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-[#C9A96E]/15 border border-[#C9A96E]/30 text-[#C9A96E] text-[7.5px] font-bold px-1.5 py-0.5 tracking-wider uppercase rounded-sm">
                    -{Math.round(product.discount)}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            {/* Stars Row */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={i < Math.floor(product.rating) ? "fill-[#C9A96E] stroke-[#C9A96E]" : "fill-transparent stroke-black/20 dark:stroke-white/20"}
                  />
                ))}
              </div>
              <span className={`text-[9.5px] tracking-wide ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>
                ({product.reviews.length})
              </span>
            </div>

            {/* Add to Cart button matching the elegant circle style */}
            <button
              onClick={() => addToCart(product, 1, selectedFinish)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:border-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-white ${
                theme === "dark" ? "border-white/10 text-white/50" : "border-black/10 text-black/50"
              }`}
              aria-label="Add to Bag"
            >
              <ShoppingCart size={13} className="transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick View Dialog ── */}
      <Dialog isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} title="" size="lg">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${theme === "dark" ? "bg-[#111111] text-white" : "bg-white text-black"}`}>
          {/* Image */}
          <div className="relative aspect-square bg-[#141414] overflow-hidden">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-[#C9A96E] text-black text-[8px] font-bold px-2 py-1 tracking-[0.15em] uppercase">
                -{Math.round(product.discount)}% OFF
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <p className="text-[8px] tracking-[0.25em] uppercase text-[#C9A96E] mb-2 font-bold">{product.category}</p>
                <h2 className="font-serif text-xl tracking-wide leading-snug">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className={i < Math.floor(product.rating) ? "fill-[#C9A96E] stroke-[#C9A96E]" : "fill-transparent stroke-black/10"} />
                    ))}
                  </div>
                  <span className="text-[9px] opacity-50 tracking-wide">{product.rating} · {product.reviews.length} reviews</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-[#C9A96E] text-xl font-light tracking-wide">{formatPrice(discountedPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-sm opacity-30 line-through">{formatPrice(product.price)}</span>
                )}
              </div>

              <p className="text-[11px] opacity-60 leading-[2] tracking-wider">{product.description.slice(0, 180)}...</p>

              <div className="border-t border-b border-black/5 dark:border-white/5 py-4 space-y-2">
                {[
                  ["Dimensions", product.dimensions],
                  ["Material", product.material],
                  ["Finish", product.finish.split(",")[0]],
                  ["Bulbs", product.bulbs],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-[10px] tracking-wider">
                    <span className="opacity-40 w-20 shrink-0 uppercase">{k}</span>
                    <span className="opacity-80">{v}</span>
                  </div>
                ))}
              </div>

              {finishesList.length > 1 && (
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase opacity-45 mb-2">Select Finish</p>
                  <div className="flex flex-wrap gap-2">
                    {finishesList.map(finish => (
                      <button
                        key={finish}
                        onClick={() => setSelectedFinish(finish)}
                        className={`px-3 py-1.5 border text-[9px] uppercase tracking-widest transition-all ${
                          selectedFinish === finish
                            ? "bg-[#C9A96E] text-black border-[#C9A96E]"
                            : "bg-transparent opacity-50 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30"
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="gold"
                onClick={() => { addToCart(product, 1, selectedFinish); setIsQuickViewOpen(false); }}
                className="flex-1"
              >
                Add to Bag
              </Button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`px-4 border transition-colors ${inWishlist ? "border-[#C9A96E]/40 text-[#C9A96E]" : "border-black/10 dark:border-white/10 text-white/50 hover:text-white"}`}
                aria-label="Wishlist"
              >
                <Heart size={15} className={inWishlist ? "fill-[#C9A96E] stroke-[#C9A96E]" : ""} />
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

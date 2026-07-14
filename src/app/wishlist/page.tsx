"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, formatPrice } = useCart();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#C5A880] font-medium block mb-2">
            Favorites curation
          </span>
          <h1 className="font-serif text-3xl uppercase tracking-widest text-white">
            Your Wishlist
          </h1>
          <div className="w-12 h-[1px] bg-[#C5A880]/30 mt-4" />
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((prod) => {
              const discountedPrice = prod.price * (1 - prod.discount / 100);
              return (
                <div
                  key={prod.id}
                  className="group flex flex-col bg-[#0d0d0d] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 justify-between"
                >
                  {/* Photo area */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#161616]">
                    <Link href={`/shop/${prod.slug}`}>
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </Link>
                    {/* Delete button */}
                    <button
                      onClick={() => toggleWishlist(prod)}
                      className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur-md border border-white/5 text-white/60 hover:text-red-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Content details */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-[0.25em] uppercase text-white/30 block font-medium">
                        {prod.category}
                      </span>
                      <Link
                        href={`/shop/${prod.slug}`}
                        className="text-xs uppercase tracking-widest text-white hover:text-[#C5A880] transition-colors font-sans block truncate"
                      >
                        {prod.name}
                      </Link>
                      <p className="text-[10px] text-white/40 tracking-wider font-sans font-light truncate">
                        {prod.material} &middot; {prod.finish.split(",")[0]}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs tracking-widest text-[#C5A880] font-sans font-medium">
                        {formatPrice(discountedPrice)}
                      </span>
                      
                      <button
                        onClick={() => {
                          addToCart(prod, 1);
                          toggleWishlist(prod); // Remove from favorites when moved to cart
                        }}
                        className="text-[9px] tracking-[0.2em] uppercase text-white hover:text-[#C5A880] flex items-center gap-1 transition-colors font-sans font-semibold"
                      >
                        <ShoppingCart size={11} />
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty wishlist state */
          <div className="py-24 text-center space-y-6 bg-[#0d0d0d] border border-white/5 max-w-xl mx-auto">
            <Heart size={48} className="text-white/20 mx-auto" />
            <p className="text-xs text-white/40 uppercase tracking-widest font-light">
              Your favorites list is currently empty
            </p>
            <Button variant="gold">
              <Link href="/shop">Explore Showroom</Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

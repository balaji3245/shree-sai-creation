"use client";

import React, { useState, useMemo, use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Heart, Share2, Star, ArrowLeft, Plus, Minus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { getStoredProducts, mapBackendProductToFrontend } from "@/utils/db";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  // Unwrap params using React.use()
  const { slug } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await fetch(`/api/v1/products/${slug}`);
        const data = await res.json();
        if (res.ok && data.product) {
          const mapped = mapBackendProductToFrontend(data.product);
          
          const allRes = await fetch("/api/v1/products?limit=100");
          const allData = await allRes.json();
          if (allRes.ok && allData.products) {
            const allMapped = allData.products.map(mapBackendProductToFrontend);
            const list = allMapped.some((p: Product) => p.slug === slug) 
              ? allMapped 
              : [mapped, ...allMapped];
            setProducts(list);
          } else {
            setProducts([mapped]);
          }
        } else {
          setProducts(getStoredProducts());
        }
      } catch (err) {
        console.error("Failed to load product details from backend:", err);
        setProducts(getStoredProducts());
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProductDetail();
  }, [slug]);

  // Retrieve matching product
  const product = useMemo(() => {
    return products.find((p) => p.slug === slug);
  }, [products, slug]);

  const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useCart();

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (product) {
      const stored = localStorage.getItem("shree_sai_recently_viewed");
      let list: string[] = stored ? JSON.parse(stored) : [];
      
      // Filter out the current product and limit
      list = list.filter((id) => id !== product.id);
      list.unshift(product.id);
      list = list.slice(0, 5); // store up to 5 items
      
      localStorage.setItem("shree_sai_recently_viewed", JSON.stringify(list));
      
      // Load products objects for recently viewed list (excluding current)
      const recentSlugs = list.filter((id) => id !== product.id);
      const recentProds = products.filter((p) => recentSlugs.includes(p.id));
      setRecentlyViewed(recentProds);
    }
  }, [product, products]);

  // Active state handlers
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none", transform: "scale(1)", transformOrigin: "0% 0%" });
  const [selectedFinish, setSelectedFinish] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("specifications");
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync selected finish when product is loaded
  useEffect(() => {
    if (product) {
      setSelectedFinish(product.finish.split(",")[0]?.trim() || "");
    }
  }, [product]);

  // Generate Related Products list
  const relatedList = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => product.relatedProducts.includes(p.id));
  }, [products, product]);

  if (isLoaded && !product) {
    notFound();
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-xs uppercase tracking-widest text-white/40">
        Loading product...
      </div>
    );
  }

  const finishesList = product.finish.split(",").map((f) => f.trim());
  const discountedPrice = product.price * (1 - product.discount / 100);

  // Image zoom handler on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      transform: "scale(2)",
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none", transform: "scale(1)", transformOrigin: "0% 0%" });
  };

  // Copy share link mockup
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-10 text-xs uppercase tracking-widest flex items-center gap-2">
          <Link href="/shop" className="text-white/40 hover:text-white inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={12} />
            Showroom
          </Link>
          <span className="text-white/20">&middot;</span>
          <span className="text-white/40">{product.category}</span>
          <span className="text-white/20">&middot;</span>
          <span className="text-white/70">{product.name}</span>
        </div>

        {/* Product Details Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Column 1: Gallery with thumbnail strip and Zoom preview */}
          <div className="space-y-4">
            {/* Primary Main Image Viewer */}
            <div
              className="relative aspect-square w-full bg-[#111] border border-white/5 overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: zoomStyle.transform,
                  transformOrigin: zoomStyle.transformOrigin,
                }}
              />
              
              {/* Optional zoom badge overlay */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[8px] uppercase tracking-widest text-white/60 pointer-events-none flex items-center gap-1">
                <Info size={10} />
                Hover to magnify
              </div>
            </div>

            {/* Thumbnail Select Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 aspect-square border overflow-hidden transition-all bg-[#111] ${
                      idx === activeImageIdx ? "border-[#C5A880]" : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Information and Ordering parameters */}
          <div className="space-y-8">
            <div className="space-y-4 border-b border-white/5 pb-6">
              <span className="text-[10px] tracking-[0.35em] uppercase text-[#C5A880] font-medium block">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider text-white">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
                <div className="flex items-center text-[#C5A880] gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-[#C5A880] stroke-[#C5A880]"
                          : "stroke-white/20"
                      }
                    />
                  ))}
                  <span className="text-[10px] text-white/50 tracking-wider ml-1">
                    ({product.rating})
                  </span>
                </div>
                <span className="text-white/20">|</span>
                <span className="text-white/40">{product.reviews.length} Customer Reviews</span>
              </div>

              {/* Price Details */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl tracking-widest text-[#C5A880] font-serif font-light">
                  {formatPrice(discountedPrice)}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm tracking-widest text-white/30 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm uppercase text-white/60 tracking-wider leading-relaxed font-light">
              {product.description}
            </p>

            {/* Finish Picker Swatches */}
            {finishesList.length > 1 && (
              <div className="space-y-3.5 uppercase tracking-widest text-[10px]">
                <h4 className="text-white/50 font-medium">Selected Finish: <span className="text-white">{selectedFinish}</span></h4>
                <div className="flex flex-wrap gap-2.5">
                  {finishesList.map((finish) => (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`px-4 py-2 border text-[9px] font-sans font-medium transition-all ${
                        selectedFinish === finish
                          ? "bg-[#C5A880] text-black border-[#C5A880]"
                          : "bg-transparent text-white border-white/10 hover:border-white/30"
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Counter and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Counter */}
                <div className="flex items-center border border-white/15 px-2 py-1.5 bg-black h-12">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 text-xs font-sans font-medium text-white select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 text-white/50 hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart button */}
                <Button
                  variant="gold"
                  onClick={() => addToCart(product, quantity, selectedFinish)}
                  className="flex-grow h-12"
                >
                  Add to Bag
                </Button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-3.5 border border-white/15 hover:border-white text-white transition-colors h-12 flex items-center justify-center"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    size={16}
                    className={isInWishlist(product.id) ? "fill-[#C5A880] stroke-[#C5A880]" : ""}
                  />
                </button>
              </div>

              {/* Share & Shipping details */}
              <div className="flex flex-wrap items-center justify-between text-[9px] uppercase tracking-widest text-white/40 pt-2 border-b border-white/5 pb-4">
                <p>STATUS: <span className="text-[#C5A880] font-semibold">{product.stock > 0 ? "IN STOCK & READY TO SHIP" : "LIMITED PRODUCTION RUN"}</span></p>
                <button onClick={handleShare} className="hover:text-white flex items-center gap-1 transition-colors">
                  <Share2 size={11} />
                  {copiedShare ? "LINK COPIED" : "SHARE SPEC"}
                </button>
              </div>
            </div>

            {/* Expandable blueprints and care instructions accordions */}
            <div className="space-y-2.5">
              {[
                {
                  id: "specifications",
                  title: "Specifications & Details",
                  content: (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 uppercase tracking-widest text-[9px] text-white/50">
                      <p className="border-b border-white/5 pb-1"><strong className="text-white/60">Dimensions:</strong></p>
                      <p className="border-b border-white/5 pb-1 text-white/80">{product.dimensions}</p>
                      <p className="border-b border-white/5 pb-1"><strong className="text-white/60">Materials:</strong></p>
                      <p className="border-b border-white/5 pb-1 text-white/80">{product.material}</p>
                      <p className="border-b border-white/5 pb-1"><strong className="text-white/60">Finishes:</strong></p>
                      <p className="border-b border-white/5 pb-1 text-white/80">{product.finish}</p>
                      <p className="border-b border-white/5 pb-1"><strong className="text-white/60">Sockets:</strong></p>
                      <p className="border-b border-white/5 pb-1 text-white/80">{product.bulbs}</p>
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <React.Fragment key={key}>
                          <p className="border-b border-white/5 pb-1"><strong className="text-white/60">{key}:</strong></p>
                          <p className="border-b border-white/5 pb-1 text-white/80">{val}</p>
                        </React.Fragment>
                      ))}
                    </div>
                  ),
                },
                {
                  id: "features",
                  title: "Key Craft Features",
                  content: (
                    <ul className="list-disc list-inside space-y-2 text-[10px] uppercase tracking-widest text-white/50 leading-relaxed font-light">
                      {product.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "shipping",
                  title: "Worldwide White-Glove Shipping",
                  content: (
                    <p className="text-[10px] uppercase tracking-widest text-white/50 leading-relaxed font-light">
                      Due to the fragile nature of hand-blown glass and natural Spanish minerals, this fixture ships crated in solid timber packing boxes. Includes fully insured priority air-freight transport and concierge customs coordination.
                    </p>
                  ),
                },
              ].map((acc) => (
                <div key={acc.id} className="border border-white/5 bg-[#0d0d0d]">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    className="w-full flex justify-between items-center px-5 py-4 text-left border-none outline-none cursor-pointer"
                  >
                    <span className="font-serif text-xs uppercase text-white tracking-widest">{acc.title}</span>
                    <span className="text-white/40">{activeAccordion === acc.id ? "—" : "+"}</span>
                  </button>
                  {activeAccordion === acc.id && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5">{acc.content}</div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24 border-t border-white/5 pt-16">
          <div className="mb-12">
            <h2 className="font-serif text-2xl uppercase tracking-widest text-white mb-2">
              Customer Endorsements
            </h2>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">
              Verified owners detailing their architectural setups
            </p>
          </div>

          {product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-6 bg-[#0d0d0d] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                    <span className="text-white font-medium">{rev.author}</span>
                    <span className="text-white/30">{rev.date}</span>
                  </div>
                  <div className="flex text-[#C5A880] gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < rev.rating ? "fill-[#C5A880] stroke-[#C5A880]" : "stroke-white/20"}
                      />
                    ))}
                  </div>
                  <p className="text-xs uppercase tracking-wider text-white/60 leading-relaxed font-light">
                    &quot;{rev.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-[#0d0d0d] border border-white/5 text-center">
              <p className="text-xs text-white/30 uppercase tracking-widest font-light">
                No reviews have been written for this lighting fixture yet
              </p>
            </div>
          )}
        </section>

        {/* Related Products Section */}
        {relatedList.length > 0 && (
          <section className="mt-24 border-t border-white/5 pt-16">
            <div className="mb-12 text-center">
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#C5A880] mb-2 block font-medium">
                Complete the Design
              </span>
              <h2 className="font-serif text-2xl uppercase tracking-widest text-white">
                Related Lighting Pieces
              </h2>
              <div className="w-12 h-[1px] bg-[#C5A880]/30 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedList.map((relatedProd) => (
                <ProductCard key={relatedProd.id} product={relatedProd} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="mt-24 border-t border-white/5 pt-16">
            <div className="mb-12 text-center">
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#C5A880] mb-2 block font-medium">
                Your Showroom Navigation
              </span>
              <h2 className="font-serif text-2xl uppercase tracking-widest text-white">
                Recently Viewed
              </h2>
              <div className="w-12 h-[1px] bg-[#C5A880]/30 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentlyViewed.slice(0, 4).map((recentProd) => (
                <ProductCard key={recentProd.id} product={recentProd} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

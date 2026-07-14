"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PRODUCTS, CATEGORIES, MATERIALS, FINISHES } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { SlidersHorizontal, Grid, List, X, Search, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCart();

  // Read URL parameters if set, for seamless mega menu routing
  const urlCategory = searchParams.get("category");
  const urlMaterial = searchParams.get("material");

  // State filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedFinish, setSelectedFinish] = useState("All");
  const [priceTier, setPriceTier] = useState("All"); // All, Tier1 (under 2k), Tier2 (2k-5k), Tier3 (over 5k)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default"); // default, priceAsc, priceDesc, rating
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Synchronize URL parameters if they change
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlMaterial) {
      setSelectedMaterial(urlMaterial);
    }
  }, [urlCategory, urlMaterial]);

  // Clean filters button helper
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedMaterial("All");
    setSelectedFinish("All");
    setPriceTier("All");
    setSearchQuery("");
    setSortOption("default");
    router.push("/shop"); // Clear URL search query
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== "All" ||
      selectedMaterial !== "All" ||
      selectedFinish !== "All" ||
      priceTier !== "All" ||
      searchQuery !== ""
    );
  }, [selectedCategory, selectedMaterial, selectedFinish, priceTier, searchQuery]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Search query match
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.material.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category match
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Material match
    if (selectedMaterial !== "All") {
      result = result.filter((p) => p.material.toLowerCase().includes(selectedMaterial.toLowerCase()));
    }

    // Finish match
    if (selectedFinish !== "All") {
      result = result.filter((p) => p.finish.toLowerCase().includes(selectedFinish.toLowerCase()));
    }

    // Price tier match (INR ranges)
    if (priceTier !== "All") {
      result = result.filter((p) => {
        const discountPrice = p.price * (1 - p.discount / 100);
        if (priceTier === "under-5000") return discountPrice < 5000;
        if (priceTier === "5000-20000") return discountPrice >= 5000 && discountPrice <= 20000;
        if (priceTier === "over-20000") return discountPrice > 20000;
        return true;
      });
    }

    // Sorting
    if (sortOption === "priceAsc") {
      result.sort((a, b) => {
        const pA = a.price * (1 - a.discount / 100);
        const pB = b.price * (1 - b.discount / 100);
        return pA - pB;
      });
    } else if (sortOption === "priceDesc") {
      result.sort((a, b) => {
        const pA = a.price * (1 - a.discount / 100);
        const pB = b.price * (1 - b.discount / 100);
        return pB - pA;
      });
    } else if (sortOption === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedMaterial, selectedFinish, priceTier, sortOption]);

  return (
    <div className="relative w-full bg-[#0a0a0a] min-h-screen text-white font-sans">
      {/* 1. Header Banner */}
      <div className="relative py-20 bg-[#070707] border-b border-white/5 overflow-hidden">
        {/* Soft background light */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none ambient-light-top" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#C5A880] font-medium block">
            Shree Sai Creation Showroom
          </span>
          <h1 className="font-serif text-3xl md:text-5xl uppercase tracking-widest text-white">
            Fine Decorative Lighting
          </h1>
          <p className="text-xs uppercase text-white/50 max-w-md mx-auto tracking-widest leading-relaxed font-light">
            Browse our catalog of luxury statement pieces. Filter by mineral materials, custom metal finishes, and design forms.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 2. Unified Controls & Filters */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 mt-12 bg-black/40 p-4 border border-white/5 w-full">
          
          {/* Left Side: Count & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-4 xl:gap-6 w-full xl:w-auto text-[9px] uppercase tracking-widest text-white/50">
            
            {/* Found Items Count */}
            <span className="text-[10px] text-[#C5A880] font-medium mr-4 xl:mr-2">
              Showing {filteredProducts.length} pieces
            </span>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-white border-b border-white/10 pb-0.5 outline-none cursor-pointer focus:border-[#C5A880]"
              >
                <option value="All" className="bg-[#0d0d0d]">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0d0d0d]">{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <span>Price:</span>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="bg-transparent text-white border-b border-white/10 pb-0.5 outline-none cursor-pointer focus:border-[#C5A880]"
              >
                <option value="All" className="bg-[#0d0d0d]">All Prices</option>
                <option value="under-5000" className="bg-[#0d0d0d]">Under ₹5,000</option>
                <option value="5000-20000" className="bg-[#0d0d0d]">₹5,000 – ₹20,000</option>
                <option value="over-20000" className="bg-[#0d0d0d]">Over ₹20,000</option>
              </select>
            </div>

            {/* Material Filter */}
            <div className="flex items-center gap-2">
              <span>Material:</span>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="bg-transparent text-white border-b border-white/10 pb-0.5 outline-none cursor-pointer focus:border-[#C5A880]"
              >
                <option value="All" className="bg-[#0d0d0d]">All Materials</option>
                {MATERIALS.map(mat => (
                  <option key={mat} value={mat} className="bg-[#0d0d0d]">{mat}</option>
                ))}
              </select>
            </div>

            {/* Finish Filter */}
            <div className="flex items-center gap-2">
              <span>Finish:</span>
              <select
                value={selectedFinish}
                onChange={(e) => setSelectedFinish(e.target.value)}
                className="bg-transparent text-white border-b border-white/10 pb-0.5 outline-none cursor-pointer focus:border-[#C5A880]"
              >
                <option value="All" className="bg-[#0d0d0d]">All Finishes</option>
                {FINISHES.map(fin => (
                  <option key={fin} value={fin} className="bg-[#0d0d0d]">{fin}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Side: Search */}
          <div className="flex items-center gap-3 w-full xl:w-auto">
            {/* Filter Toggle Mobile */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white/70 hover:text-white"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            {/* Search Input */}
            <div className="relative flex-1 md:w-72 flex items-center border border-white/10 bg-[#0d0d0d] px-3 py-2 focus-within:border-white/40 transition-colors">
              <Search className="text-white/30 mr-2" size={14} />
              <input
                type="text"
                placeholder="SEARCH SPECIFIC LIGHT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[10px] tracking-widest uppercase text-white placeholder-white/20 border-none focus:outline-none focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 3. Active Filters Chip Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8 text-[9px] uppercase tracking-widest">
            <span className="text-white/30">Active Filters:</span>
            {selectedCategory !== "All" && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 text-white">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="hover:text-[#C5A880]">
                  <X size={10} />
                </button>
              </span>
            )}
            {selectedMaterial !== "All" && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 text-white">
                Material: {selectedMaterial}
                <button onClick={() => setSelectedMaterial("All")} className="hover:text-[#C5A880]">
                  <X size={10} />
                </button>
              </span>
            )}
            {selectedFinish !== "All" && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 text-white">
                Finish: {selectedFinish}
                <button onClick={() => setSelectedFinish("All")} className="hover:text-[#C5A880]">
                  <X size={10} />
                </button>
              </span>
            )}
            {priceTier !== "All" && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 text-white">
                Price: {priceTier === "under-5000" ? "Under ₹5,000" : priceTier === "5000-20000" ? "₹5,000 – ₹20,000" : "Over ₹20,000"}
                <button onClick={() => setPriceTier("All")} className="hover:text-[#C5A880]">
                  <X size={10} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 text-white">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="hover:text-[#C5A880]">
                  <X size={10} />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[#C5A880] hover:text-[#D4AF37] font-medium flex items-center gap-1.5 border border-dashed border-[#C5A880]/30 px-3 py-1 transition-all bg-transparent"
            >
              <RotateCcw size={10} />
              Reset All
            </button>
          </div>
        )}

        {/* 4. Main Product Grid */}
        <div className="w-full">
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              layoutMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* List view layout */
                <div className="space-y-6">
                  {filteredProducts.map((p) => {
                    const dPrice = p.price * (1 - p.discount / 100);
                    return (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row bg-[#0d0d0d] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10"
                      >
                        <Link href={`/shop/${p.slug}`} className="relative w-full sm:w-60 aspect-[4/3] bg-[#161616] overflow-hidden">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[9px] tracking-[0.25em] uppercase text-[#C5A880] font-medium block">
                              {p.category}
                            </span>
                            <Link
                              href={`/shop/${p.slug}`}
                              className="text-sm uppercase tracking-widest text-white hover:text-[#C5A880] transition-colors font-sans block"
                            >
                              {p.name}
                            </Link>
                            <p className="text-xs text-white/50 tracking-wider font-light leading-relaxed line-clamp-2 uppercase">
                              {p.description}
                            </p>
                            <p className="text-[9px] text-white/30 tracking-widest uppercase mt-1">
                              Material: {p.material} &middot; Finish: {p.finish}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#C5A880] tracking-widest font-sans font-medium">
                                {formatPrice(dPrice)}
                              </span>
                              {p.discount > 0 && (
                                <span className="text-[10px] text-white/30 line-through">
                                  {formatPrice(p.price)}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/shop/${p.slug}`}
                              className="text-[9px] tracking-[0.2em] uppercase text-white hover:text-[#C5A880] border-b border-white/20 pb-0.5"
                            >
                              View Fixture
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* No matching items state */
              <div className="py-20 text-center space-y-4 bg-[#0d0d0d] border border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-widest font-light">
                  No luxury fixtures match your filter settings
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-white text-black text-[10px] tracking-widest uppercase hover:bg-[#C5A880] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex justify-center items-center gap-4 text-xs tracking-widest">
                <button className="px-4 py-2 border border-white/10 hover:border-white transition-colors text-white/40 hover:text-white disabled:opacity-30 disabled:pointer-events-none" disabled>
                  Prev
                </button>
                <span className="text-[10px] text-[#C5A880] font-medium font-sans">
                  PAGE 1 OF 1
                </span>
                <button className="px-4 py-2 border border-white/10 hover:border-white transition-colors text-white/40 hover:text-white disabled:opacity-30 disabled:pointer-events-none" disabled>
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Mobile Drawer Filters Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-[4px]"
          />
          {/* Drawer content panel */}
          <div className="relative w-80 bg-[#0a0a0a] border-r border-white/10 h-full flex flex-col z-10 overflow-y-auto p-6 uppercase tracking-widest text-[9px] space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-serif text-sm tracking-[0.2em] uppercase text-[#C5A880]">
                Filter Catalog
              </h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>



            {/* Price Tiers Filter Mobile */}
            <div className="space-y-3">
              <h4 className="font-serif text-[10px] text-[#C5A880] tracking-wider pb-1 border-b border-white/5">
                Price Tiers
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { id: "All", name: "All Prices" },
                  { id: "under-5000", name: "Under ₹5,000" },
                  { id: "5000-20000", name: "₹5,000 – ₹20,000" },
                  { id: "over-20000", name: "Over ₹20,000" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setPriceTier(tier.id);
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`text-left text-white/60 hover:text-white ${
                      priceTier === tier.id ? "text-[#C5A880] font-semibold" : ""
                    }`}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Filter Mobile */}
            <div className="space-y-3">
              <h4 className="font-serif text-[10px] text-[#C5A880] tracking-wider pb-1 border-b border-white/5">
                Materials
              </h4>
              <div className="flex flex-col gap-2">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`text-left text-white/60 hover:text-white ${
                      selectedMaterial === mat ? "text-[#C5A880] font-semibold" : ""
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Metal Finish Filter Mobile */}
            <div className="space-y-3">
              <h4 className="font-serif text-[10px] text-[#C5A880] tracking-wider pb-1 border-b border-white/5">
                Metal Finishes
              </h4>
              <div className="flex flex-col gap-2 font-light">
                {FINISHES.map((fin) => (
                  <button
                    key={fin}
                    onClick={() => {
                      setSelectedFinish(fin);
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`text-left text-white/60 hover:text-white ${
                      selectedFinish === fin ? "text-[#C5A880] font-semibold" : ""
                    }`}
                  >
                    {fin}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleResetFilters();
                setIsFilterDrawerOpen(false);
              }}
              className="w-full bg-[#111] hover:bg-transparent border border-white/10 hover:border-white text-white py-3 text-center uppercase tracking-widest text-[9px] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-xs uppercase tracking-widest text-white/40">Loading Showroom...</div>}>
      <ShopContent />
    </Suspense>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { Product } from "@/data/products";
import { mapBackendProductToFrontend } from "@/utils/db";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFinish: string;
  cartItemId?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, finish?: string) => void;
  removeFromCart: (productId: string, finish: string) => void;
  updateCartQuantity: (productId: string, finish: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  promoCode: string;
  applyPromoCode: (code: string) => Promise<boolean>;
  discountAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  theme: "dark" | "light";
  toggleTheme: () => void;
  mergeCartAfterLogin: () => Promise<void>;
  
  // Custom global systems
  currency: "USD" | "EUR" | "GBP" | "INR";
  setCurrency: (currency: "USD" | "EUR" | "GBP" | "INR") => void;
  formatPrice: (amount: number) => string;
  language: "EN" | "FR" | "ES";
  setLanguage: (lang: "EN" | "FR" | "ES") => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Sub-component to render client notifications
const ToastList: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-[90vw]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`p-4 shadow-2xl border flex items-center justify-between gap-3 text-[9px] uppercase tracking-widest ${
              t.type === "error"
                ? "bg-[#140b0b] border-red-500/20 text-red-400"
                : t.type === "info"
                ? "bg-[#0b0e14] border-blue-500/20 text-blue-400"
                : "bg-[#0d0d0d] border-white/5 text-[#C5A880]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0">
                {t.type === "error" ? (
                  <AlertCircle size={14} />
                ) : t.type === "info" ? (
                  <Info size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
              </span>
              <span className="text-white/80 font-sans font-light normal-case tracking-wider leading-relaxed">
                {t.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/30 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // New states
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "INR">("INR");
  const [language, setLanguage] = useState<"EN" | "FR" | "ES">("EN");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const getHeaders = () => {
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
    const guestToken = localStorage.getItem("shree_sai_guest_token");
    if (guestToken) {
      headers["x-guest-token"] = guestToken;
    }
    return headers;
  };

  const syncCartStateWithBackend = async () => {
    try {
      const headers = getHeaders();
      const res = await fetch("/api/v1/cart", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.guestToken) {
          localStorage.setItem("shree_sai_guest_token", data.guestToken);
        }
        const backendCart = data.cart;
        if (backendCart && Array.isArray(backendCart.items)) {
          const mappedItems: CartItem[] = backendCart.items.map((item: {
            productId: string;
            productName: string;
            variantTitle?: string;
            variantId: string;
            unitPriceInPaise: number;
            quantity: number;
            imageUrl?: string;
            _id: string;
          }) => ({
            product: {
              id: item.productId,
              name: item.productName,
              slug: item.productName.toLowerCase().replace(/ /g, "-"),
              description: "",
              category: "Chandelier",
              price: item.unitPriceInPaise / 100,
              discount: 0,
              rating: 5,
              reviews: [],
              dimensions: "",
              material: "",
              finish: item.variantTitle || "",
              bulbs: "",
              stock: 10,
              images: [item.imageUrl || ""],
              features: [],
              specifications: {},
              relatedProducts: [],
              defaultVariantId: item.variantId
            },
            quantity: item.quantity,
            selectedFinish: item.variantTitle || "Default",
            cartItemId: item._id
          }));
          setCart(mappedItems);
          
          if (backendCart.couponCode) {
            setPromoCode(backendCart.couponCode);
            if (data.summary && data.summary.discountInPaise > 0) {
              const subTotal = data.summary.subtotalInPaise || 1;
              const percent = Math.round((data.summary.discountInPaise / subTotal) * 100);
              setDiscountPercent(percent);
            } else {
              setDiscountPercent(0);
            }
          } else {
            setPromoCode("");
            setDiscountPercent(0);
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync cart with backend:", e);
    }
  };

  const syncWishlistWithBackend = async () => {
    const storedUser = localStorage.getItem("shree_sai_user");
    if (!storedUser) return;
    try {
      const headers = getHeaders();
      const res = await fetch("/api/v1/wishlist", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setWishlist(data.products.map(mapBackendProductToFrontend));
        }
      }
    } catch (e) {
      console.error("Error syncing wishlist:", e);
    }
  };

  const mergeCartAfterLogin = async () => {
    const guestToken = localStorage.getItem("shree_sai_guest_token");
    try {
      if (guestToken) {
        const headers = getHeaders();
        const res = await fetch("/api/v1/cart/merge", {
          method: "POST",
          headers,
          body: JSON.stringify({ guestToken })
        });
        if (res.ok) {
          localStorage.removeItem("shree_sai_guest_token");
        }
      }
    } catch (err) {
      console.error("Failed to merge cart:", err);
    } finally {
      await syncCartStateWithBackend();
      await syncWishlistWithBackend();
    }
  };

  // Load from local storage after mount to prevent SSR mismatch
  useEffect(() => {
    const initCartAndWishlist = async () => {
      const savedTheme = localStorage.getItem("shree_sai_creation_theme") as "dark" | "light" | null;
      const savedLanguage = localStorage.getItem("shree_sai_creation_language") as "EN" | "FR" | "ES" | null;

      if (savedTheme) {
        setTheme(savedTheme);
        const root = document.documentElement;
        if (savedTheme === "light") {
          root.classList.add("light");
        } else {
          root.classList.remove("light");
        }
      }
      setCurrency("INR");
      if (savedLanguage) setLanguage(savedLanguage as "EN" | "FR" | "ES");
      
      // Load local cart storage first
      const savedCart = localStorage.getItem("shree_sai_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        } catch (e) {
          console.error("Error loading local cart:", e);
        }
      }

      await syncCartStateWithBackend();
      await syncWishlistWithBackend();
      setMounted(true);
    };
    initCartAndWishlist();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("shree_sai_creation_theme", theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("shree_sai_creation_currency", currency);
    }
  }, [currency, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("shree_sai_creation_language", language);
    }
  }, [language, mounted]);

  // Toast functions
  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Currency Formatter — always INR (₹)
  const formatPrice = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        if (next === "light") {
          root.classList.add("light");
        } else {
          root.classList.remove("light");
        }
      }
      return next;
    });
  };

  const addToCart = async (product: Product, quantity = 1, finish = "") => {
    const selectedFinish = finish || (product.finish ? product.finish.split(",")[0]?.trim() : "") || "Default";
    
    // Update local state & LocalStorage immediately for instant response
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedFinish === selectedFinish
      );
      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updated = [
          ...prev,
          {
            product,
            quantity,
            selectedFinish,
            cartItemId: `cart_item_${Date.now()}`
          }
        ];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("shree_sai_cart", JSON.stringify(updated));
      }
      return updated;
    });

    addToast(`${product.name} added to your order bag.`, "success");
    setIsCartOpen(true);

    // Sync with backend if endpoint exists
    try {
      const headers = getHeaders();
      const payload = {
        productId: product.id,
        variantId: product.defaultVariantId || product.id,
        quantity
      };
      await fetch("/api/v1/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
    } catch {
      // Ignore backend cart API missing errors gracefully
    }
  };

  const removeFromCart = async (productId: string, finish: string) => {
    setCart((prev) => {
      const updated = prev.filter(
        (item) => !(item.product.id === productId && item.selectedFinish === finish)
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("shree_sai_cart", JSON.stringify(updated));
      }
      return updated;
    });
    addToast("Item removed from your order bag.", "info");

    try {
      const target = cart.find(
        (item) => item.product.id === productId && item.selectedFinish === finish
      );
      if (target?.cartItemId) {
        const headers = getHeaders();
        await fetch(`/api/v1/cart/items/${target.cartItemId}`, {
          method: "DELETE",
          headers
        });
      }
    } catch {
      // Ignore
    }
  };

  const updateCartQuantity = async (productId: string, finish: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, finish);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId && item.selectedFinish === finish
          ? { ...item, quantity }
          : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("shree_sai_cart", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearCart = async () => {
    setCart([]);
    setPromoCode("");
    setDiscountPercent(0);
    if (typeof window !== "undefined") {
      localStorage.removeItem("shree_sai_cart");
    }
    addToast("Order bag cleared successfully.", "info");

    try {
      const headers = getHeaders();
      await fetch("/api/v1/cart", {
        method: "DELETE",
        headers
      });
    } catch {
      // Ignore
    }
  };

  const toggleWishlist = async (product: Product) => {
    const storedUser = localStorage.getItem("shree_sai_user");
    if (!storedUser) {
      setWishlist((prev) => {
        const exists = prev.some((item) => item.id === product.id);
        if (exists) {
          addToast(`${product.name} removed from saved coordinates.`, "info");
          return prev.filter((item) => item.id !== product.id);
        }
        addToast(`${product.name} saved to coordinates.`, "success");
        return [...prev, product];
      });
      return;
    }
    
    const exists = wishlist.some((item) => item.id === product.id);
    try {
      const headers = getHeaders();
      const method = exists ? "DELETE" : "POST";
      const url = `/api/v1/wishlist/${product.id}`;
      const res = await fetch(url, { method, headers });
      const data = await res.json();
      if (res.ok && data.products) {
        setWishlist(data.products.map(mapBackendProductToFrontend));
        addToast(
          exists 
            ? `${product.name} removed from saved coordinates.` 
            : `${product.name} saved to coordinates.`, 
          exists ? "info" : "success"
        );
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const applyPromoCode = async (code: string) => {
    const formatted = code.toUpperCase().trim();
    if (formatted === "SAI10" || formatted === "WELCOME10") {
      setPromoCode(formatted);
      setDiscountPercent(10);
      addToast(`Promo code ${formatted} (10% OFF) applied!`, "success");
      return true;
    } else if (formatted === "LUXURY20" || formatted === "SAI20") {
      setPromoCode(formatted);
      setDiscountPercent(20);
      addToast(`Promo code ${formatted} (20% OFF) applied!`, "success");
      return true;
    } else if (formatted === "VIP30") {
      setPromoCode(formatted);
      setDiscountPercent(30);
      addToast(`VIP Promo code ${formatted} (30% OFF) applied!`, "success");
      return true;
    } else {
      addToast("Invalid promo code.", "error");
      return false;
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.08;
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const total = taxableAmount + tax + shipping;

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        promoCode,
        applyPromoCode,
        discountAmount,
        subtotal,
        tax,
        shipping,
        total,
        theme,
        toggleTheme,
        mergeCartAfterLogin,
        
        // Custom global systems
        currency,
        setCurrency,
        formatPrice,
        language,
        setLanguage,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
      <ToastList toasts={toasts} removeToast={removeToast} />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

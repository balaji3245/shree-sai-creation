"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  TrendingUp,
  X,
  Search,
  SlidersHorizontal,
  FolderOpen,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";

interface DbOrderItem {
  productId: string;
  productName: string;
  unitPriceInPaise: number;
  quantity: number;
  imageUrl?: string;
}

interface DbOrder {
  _id: string;
  orderNumber: string;
  createdAt?: string;
  status: string;
  items: DbOrderItem[];
  subtotal: number;
  grandTotal: number;
  shippingAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  guestEmail?: string;
}

interface AdminDashboardOrder {
  id: string;
  dbId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  items: { id: string; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  total: number;
  date: string;
  status: "Pending" | "Crating" | "Shipped" | "Delivered";
}


export default function AdminPage() {
  const router = useRouter();
  const { formatPrice } = useCart();
  
  // Auth state
  const [isAuth, setIsAuth] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);

  // Active Tab: dashboard, products, orders, users
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");

  // Users management state
  const [users, setUsers] = useState<{ id: number; name: string; email: string; role: string; created_at: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminDashboardOrder[]>([]);

  // Search & Filter within Products list
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");

  // Add/Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    category: "Chandelier",
    price: 0,
    discount: 0,
    rating: 5,
    dimensions: "",
    material: "",
    finish: "",
    bulbs: "",
    stock: 10,
    images: "",
    features: ""
  });

  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storedUser = localStorage.getItem("shree_sai_user");
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    const token = parsed?.token;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setIsUploadingImage(true);
    try {
      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uploadData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // Append new image URL to current images input
      const currentImages = formData.images ? formData.images.split(",").map(i => i.trim()).filter(Boolean) : [];
      const updatedImages = [...currentImages, data.url].join(", ");
      setFormData(prev => ({ ...prev, images: updatedImages }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      alert(msg);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // Verify authorization on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("shree_sai_user");
    if (!storedUser) {
      router.push("/signin");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "admin") {
        router.push("/signin");
        return;
      }
      setAdminUser(parsed);
      setIsAuth(true);
      
      // Load products from new SQLite API
      fetch("/api/v1/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products && Array.isArray(data.products)) {
            // New API returns product fields directly matching frontend Product type
            const mapped = data.products.map((p: Record<string, unknown>) => ({
              id: String(p.id),
              name: p.name as string,
              slug: p.slug as string,
              description: (p.description as string) || "",
              category: (p.category as string) || "Chandelier",
              price: p.price as number,
              discount: p.discount as number,
              rating: p.rating as number,
              reviews: [],
              dimensions: (p.dimensions as string) || "",
              material: (p.material as string) || "",
              finish: (p.finish as string) || "",
              bulbs: (p.bulbs as string) || "",
              stock: p.stock as number,
              images: (p.images as string[]) || [],
              features: (p.features as string[]) || [],
              specifications: (p.specifications as Record<string, string>) || {},
              relatedProducts: (p.related_products as string[]) || [],
            }));
            setProducts(mapped);
          }
        })
        .catch((err) => console.error("Error loading products in admin page:", err));

      // Load users
      setUsersLoading(true);
      fetch("/api/v1/admin/users", {
        headers: { "Authorization": `Bearer ${parsed.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.users && Array.isArray(data.users)) setUsers(data.users);
        })
        .catch(err => console.error("Error loading users:", err))
        .finally(() => setUsersLoading(false));

      setIsOrdersLoading(true);
      fetch("/api/v1/admin/orders", {
        headers: { "Authorization": `Bearer ${parsed.token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.orders && Array.isArray(data.orders)) {
            const mapped = data.orders.map((o: Record<string, unknown>) => {
              const fullName = (o.full_name as string) || "";
              const nameParts = fullName.split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";

              let displayStatus: "Pending" | "Crating" | "Shipped" | "Delivered" = "Pending";
              const s = (o.status as string).toLowerCase();
              if (s === "pending") displayStatus = "Pending";
              else if (s === "crating") displayStatus = "Crating";
              else if (s === "shipped") displayStatus = "Shipped";
              else if (s === "delivered") displayStatus = "Delivered";

              const items = (o.items as Record<string, unknown>[]) || [];
              return {
                id: o.order_number as string,
                dbId: String(o.id),
                firstName,
                lastName,
                email: (o.email as string) || "",
                address: (o.address_line1 as string) || "",
                city: (o.address_city as string) || "",
                state: (o.address_state as string) || "",
                zip: (o.address_pincode as string) || "",
                phone: (o.phone as string) || "",
                items: items.map((item) => ({
                  id: String(item.product_id),
                  name: item.product_name as string,
                  price: item.unit_price as number,
                  quantity: item.quantity as number,
                  image: (item.product_image as string) || ""
                })),
                subtotal: o.subtotal as number,
                total: o.grand_total as number,
                date: new Date((o.created_at as string) || Date.now()).toLocaleDateString("en-IN"),
                status: displayStatus
              };
            });
            setOrders(mapped);
          }
        })
        .catch((err) => console.error("Error loading admin orders:", err))
        .finally(() => setIsOrdersLoading(false));
    } catch {
      router.push("/signin");
    }
  }, [router]);

  // Derived statistics for dashboard
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = orders.length ? totalSales / orders.length : 0;
    const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
    
    // Categorized breakdown count for simple analytics SVG
    const categoryCounts = products.reduce((acc: Record<string, number>, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSales,
      avgOrderValue,
      pendingOrdersCount,
      categoryCounts
    };
  }, [orders, products]);

  // Filtered Products for Management Grid
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                            p.id.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === "All" || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Unique categories list for filters
  const categoriesList = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Handle Log Out
  const handleLogout = () => {
    localStorage.removeItem("shree_sai_user");
    router.push("/signin");
    router.refresh();
  };

  // Open modal for Adding a new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: `prod_custom_${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      category: "Chandelier",
      price: 1500,
      discount: 0,
      rating: 5,
      dimensions: 'Diameter: 24" | Height: 30"',
      material: "Brushed Brass, Hand-Cut Crystal",
      finish: "Polished Gold, Frosted",
      bulbs: "4 x G9 LED Bulbs (Included)",
      stock: 15,
      images: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800",
      features: "Premium high-density metal framework, Individually hand-cut crystal prisms, Fully dimmable ambient glow support"
    });
    setIsProductModalOpen(true);
  };

  // Open modal for Editing an existing product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      price: product.price,
      discount: product.discount,
      rating: product.rating,
      dimensions: product.dimensions,
      material: product.material,
      finish: product.finish,
      bulbs: product.bulbs,
      stock: product.stock,
      images: product.images.join(", "),
      features: product.features.join(", ")
    });
    setIsProductModalOpen(true);
  };

  // Handle Product Add/Edit submission (calls API)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    const parsedImages = formData.images.split(",").map(i => i.trim()).filter(Boolean);
    const parsedFeatures = formData.features.split(",").map(f => f.trim()).filter(Boolean);

    const storedUser = localStorage.getItem("shree_sai_user");
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    const token = parsed?.token;

    const payload = {
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      discount: Number(formData.discount),
      rating: Number(formData.rating),
      dimensions: formData.dimensions,
      material: formData.material,
      finish: formData.finish,
      bulbs: formData.bulbs,
      stock: Number(formData.stock),
      images: parsedImages.length ? parsedImages : ["https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800"],
      features: parsedFeatures,
      specifications: {
        "Dimensions": formData.dimensions,
        "Material": formData.material,
        "Finish Options": formData.finish,
        "Bulbs Required": formData.bulbs
      }
    };

    try {
      let res: Response;
      if (editingProduct) {
        res = await fetch(`/api/v1/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/v1/products", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to save product");

      const savedP = resData.product;
      const frontendProduct: Product = {
        id: String(savedP.id),
        name: savedP.name,
        slug: savedP.slug,
        description: savedP.description || "",
        category: savedP.category || "Chandelier",
        price: savedP.price,
        discount: savedP.discount,
        rating: savedP.rating,
        reviews: [],
        dimensions: savedP.dimensions || "",
        material: savedP.material || "",
        finish: savedP.finish || "",
        bulbs: savedP.bulbs || "",
        stock: savedP.stock,
        images: savedP.images || [],
        features: savedP.features || [],
        specifications: savedP.specifications || {},
        relatedProducts: savedP.related_products || [],
      };

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? frontendProduct : p));
      } else {
        setProducts(prev => [frontendProduct, ...prev]);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      alert(msg);
    }
  };

  // Delete product handler (calls API)
  const handleProductDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const storedUser = localStorage.getItem("shree_sai_user");
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    const token = parsed?.token;

    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete product");
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      alert(msg);
    }
  };

  // Order status update handler (calls new SQLite API)
  const handleOrderStatusChange = async (orderId: string, status: "Pending" | "Crating" | "Shipped" | "Delivered") => {
    const target = orders.find(o => o.id === orderId);
    if (!target || !target.dbId) return;

    try {
      const storedUser = localStorage.getItem("shree_sai_user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const token = parsed?.token;

      const res = await fetch(`/api/v1/admin/orders/${target.dbId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update order status.");
      }
    } catch (e) {
      console.error("Error updating order status:", e);
      alert("Network error. Failed to update status.");
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] flex items-center justify-center text-xs uppercase tracking-widest text-[rgb(var(--text-muted))]">
        Verifying Administrative Access...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-85px)] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] font-sans flex">
      
      {/* ── Left Navigation Drawer ──────────────────────────────── */}
      <aside className="w-64 border-r border-[rgb(var(--border))] hidden md:flex flex-col bg-[rgb(var(--surface))] shrink-0 py-8 px-5 justify-between sticky top-[85px] h-[calc(100vh-85px)] overflow-y-auto">
        <div className="space-y-8">
          <div>
            <span className="text-[9px] tracking-[0.4em] uppercase text-[rgb(var(--gold))] font-medium block">
              Control Panel
            </span>
            <h2 className="font-serif text-lg tracking-widest uppercase text-[rgb(var(--foreground))] mt-1">
              Store Admin
            </h2>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
              { id: "products", label: "Products Catalog", icon: <Package size={16} /> },
              { id: "orders", label: "Orders Fulfilment", icon: <ShoppingBag size={16} /> },
              { id: "users", label: "User Management", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "dashboard" | "products" | "orders" | "users")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-[rgb(var(--gold))] text-black font-semibold shadow-md"
                    : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--foreground),0.03)]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-[rgb(var(--border))] pt-6 space-y-4 text-[10px] text-[rgb(var(--text-muted))]">
          <p className="tracking-wide">Logged in as:<br /><span className="text-[rgb(var(--foreground))] font-medium">{adminUser?.name}</span></p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500/80 hover:text-red-500 uppercase tracking-widest transition-colors w-full text-left"
          >
            <LogOut size={13} />
            Log Out Portal
          </button>
        </div>
      </aside>

      {/* ── Main View Panel ───────────────────────────────────────── */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Mobile quick navigation tabs */}
        <div className="flex md:hidden items-center justify-between border-b border-[rgb(var(--border))] pb-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {["dashboard", "products", "orders", "users"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "dashboard" | "products" | "orders" | "users")}
                className={`text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                  activeTab === tab 
                    ? "bg-[rgb(var(--gold))] text-black border-[rgb(var(--gold))] font-medium" 
                    : "border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-600">
            <LogOut size={16} />
          </button>
        </div>

        {/* Dynamic header summary */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <span className="text-[10px] tracking-[0.35em] uppercase text-[rgb(var(--gold))] font-medium block">
              Overview Portal
            </span>
            <h1 className="font-serif text-3xl tracking-widest text-[rgb(var(--foreground))] uppercase mt-1">
              {activeTab === "dashboard" && "Analytics Overview"}
              {activeTab === "products" && "Product Catalog Manager"}
              {activeTab === "orders" && "Fulfillment Operations"}
              {activeTab === "users" && "User Management"}
            </h1>
            <div className="w-12 h-[1.5px] bg-[rgb(var(--gold))]/30 mt-3" />
          </div>

          {activeTab === "products" && (
            <Button
              onClick={handleOpenAddModal}
              variant="gold"
              className="flex items-center gap-2 rounded-none px-5 text-xs tracking-wider uppercase font-semibold h-11"
            >
              <Plus size={15} /> Add Statement Chandelier
            </Button>
          )}
        </div>

        {/* ── TAB 1: ANALYTICS DASHBOARD ───────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-up">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Gross Revenue", value: formatPrice(stats.totalSales), icon: <TrendingUp className="text-[rgb(var(--gold))]" /> },
                { label: "Total Orders Captured", value: orders.length, icon: <ShoppingBag className="text-[rgb(var(--gold))]" /> },
                { label: "Average Order Value", value: formatPrice(stats.avgOrderValue), icon: <SlidersHorizontal className="text-[rgb(var(--gold))]" /> },
                { label: "Total Products Live", value: products.length, icon: <Package className="text-[rgb(var(--gold))]" /> }
              ].map((kpi, i) => (
                <div key={i} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-6 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase tracking-widest text-[rgb(var(--text-muted))] font-medium">
                      {kpi.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-serif text-[rgb(var(--foreground))] tracking-wide font-bold">
                      {kpi.value}
                    </p>
                  </div>
                  <div className="p-3 bg-[rgba(var(--gold),0.05)] border border-[rgba(var(--gold),0.15)] rounded-xl">
                    {kpi.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Content split grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales analytics trend SVG graph */}
              <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl p-6 lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b border-[rgb(var(--border))] pb-4">
                  <h3 className="font-serif text-sm tracking-widest uppercase font-semibold text-[rgb(var(--gold))]">
                    Sales performance index
                  </h3>
                  <span className="text-[9px] uppercase tracking-widest text-[rgb(var(--text-muted))] font-semibold flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 py-1 rounded">
                    <CheckCircle size={10} /> Live sync
                  </span>
                </div>

                <div className="relative aspect-[21/9] w-full flex items-center justify-center bg-[rgba(var(--foreground),0.01)] rounded-xl p-4">
                  {/* Mock beautiful graph vector representation using SVG */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                    <defs>
                      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(var(--gold))" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="rgb(var(--gold))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Gridlines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(var(--foreground), 0.03)" strokeWidth="0.5" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(var(--foreground), 0.03)" strokeWidth="0.5" />
                    <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(var(--foreground), 0.03)" strokeWidth="0.5" />
                    
                    {/* Fill Area */}
                    <path d="M 0 35 Q 15 25 30 28 T 60 12 T 90 22 T 100 15 L 100 40 L 0 40 Z" fill="url(#glow)" />
                    
                    {/* Curve line */}
                    <path d="M 0 35 Q 15 25 30 28 T 60 12 T 90 22 T 100 15" fill="none" stroke="rgb(var(--gold))" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* Nodes */}
                    <circle cx="30" cy="28" r="1.5" fill="rgb(var(--foreground))" stroke="rgb(var(--gold))" strokeWidth="0.8" />
                    <circle cx="60" cy="12" r="1.5" fill="rgb(var(--foreground))" stroke="rgb(var(--gold))" strokeWidth="0.8" />
                    <circle cx="90" cy="22" r="1.5" fill="rgb(var(--foreground))" stroke="rgb(var(--gold))" strokeWidth="0.8" />
                  </svg>
                </div>
              </div>

              {/* Recent Orders Widget */}
              <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl p-6 flex flex-col space-y-6">
                <div className="border-b border-[rgb(var(--border))] pb-4 flex justify-between items-center">
                  <h3 className="font-serif text-sm tracking-widest uppercase font-semibold text-[rgb(var(--gold))]">
                    Recent orders
                  </h3>
                  <button onClick={() => setActiveTab("orders")} className="text-[9px] uppercase tracking-widest text-[rgb(var(--text-muted))] hover:text-[rgb(var(--foreground))] font-semibold">
                    View All
                  </button>
                </div>

                <div className="divide-y divide-[rgb(var(--border))] flex-grow overflow-y-auto max-h-[220px]">
                  {orders.length ? (
                    orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-[10px] tracking-wider uppercase">
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">{order.firstName} {order.lastName}</p>
                          <p className="text-[rgb(var(--text-muted))] mt-1">{order.id} | {order.date.split(" at ")[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[rgb(var(--foreground))]">{formatPrice(order.total)}</p>
                          <span className={`inline-block text-[8px] tracking-widest px-2 py-0.5 rounded-full mt-1.5 ${
                            order.status === "Pending" ? "bg-amber-500/10 text-amber-400" :
                            order.status === "Crating" ? "bg-[#C5A880]/10 text-[#C5A880]" :
                            order.status === "Shipped" ? "bg-blue-500/10 text-blue-400" :
                            "bg-green-500/10 text-green-400"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[10px] uppercase text-[rgb(var(--text-muted))] tracking-widest py-10">
                      No customer transactions captured yet
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: PRODUCTS CATALOG MANAGER ─────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fade-up">
            
            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-4 rounded-xl text-[10px] uppercase tracking-wider text-[rgb(var(--text-secondary))]">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80 flex items-center border border-[rgb(var(--border))] bg-[rgb(var(--background))] rounded-full px-3.5 py-2">
                <Search size={14} className="text-[rgb(var(--text-muted))] mr-2" />
                <input
                  type="text"
                  placeholder="Search product name or ID..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-transparent border-none text-[9.5px] tracking-wider uppercase text-[rgb(var(--foreground))] focus:outline-none focus:ring-0 placeholder-[rgb(var(--text-muted))]/40"
                />
                {productSearch && (
                  <button onClick={() => setProductSearch("")} className="text-[rgb(var(--text-muted))]">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category dropdown filter */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span>Filter Category:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-transparent text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] focus:border-[rgb(var(--gold))] outline-none pb-0.5"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat} className="bg-[rgb(var(--background))]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table list */}
            <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] tracking-widest uppercase">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border))] bg-[rgba(var(--foreground),0.015)] text-[rgb(var(--text-muted))]">
                      <th className="p-4 pl-6 font-semibold">Chandelier Product</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Stock status</th>
                      <th className="p-4 pr-6 text-right font-semibold">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border))]">
                    {filteredProducts.length ? (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[rgba(var(--foreground),0.005)] transition-colors">
                          
                          {/* Image & Name column */}
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <div className="w-12 h-9 rounded-lg overflow-hidden shrink-0 border border-[rgb(var(--border))]">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-[rgb(var(--foreground))] text-[11px] font-serif tracking-normal normal-case">{p.name}</p>
                              <p className="text-[9px] text-[rgb(var(--text-muted))] tracking-widest">{p.id}</p>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4 text-[rgb(var(--text-secondary))]">{p.category}</td>

                          {/* Pricing */}
                          <td className="p-4">
                            <p className="font-semibold text-[rgb(var(--foreground))]">{formatPrice(p.price)}</p>
                            {p.discount > 0 && <p className="text-[8px] text-green-500">-{p.discount}% OFF</p>}
                          </td>

                          {/* Stock status */}
                          <td className="p-4">
                            {p.stock > 0 ? (
                              <span className="text-[9px] text-green-400 font-medium">In Stock ({p.stock})</span>
                            ) : (
                              <span className="text-[9px] text-red-400 font-medium">Out of stock</span>
                            )}
                          </td>

                          {/* Operations */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center gap-3.5 justify-end">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--gold))] transition-colors flex items-center gap-1.5"
                                title="Edit Product details"
                              >
                                <Edit2 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleProductDelete(p.id)}
                                className="text-red-500/70 hover:text-red-500 transition-colors flex items-center gap-1.5"
                                title="Delete Product"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-[10px] text-[rgb(var(--text-muted))] tracking-widest uppercase">
                          No matching catalog items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ORDERS FULFILMENT TRACKER ─────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fade-up">
            <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] tracking-widest uppercase">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border))] bg-[rgba(var(--foreground),0.015)] text-[rgb(var(--text-muted))]">
                      <th className="p-4 pl-6 font-semibold">Reference ID</th>
                      <th className="p-4 font-semibold">Client details</th>
                      <th className="p-4 font-semibold">Order Date</th>
                      <th className="p-4 font-semibold">Order Items</th>
                      <th className="p-4 font-semibold">Total Price</th>
                      <th className="p-4 pr-6 font-semibold">Fulfillment status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border))]">
                    {orders.length ? (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[rgba(var(--foreground),0.005)] transition-colors">
                          
                          {/* Order Reference */}
                          <td className="p-4 pl-6">
                            <span className="font-serif font-bold text-[rgb(var(--foreground))] text-[11px] block">{order.id}</span>
                            <span className="text-[8px] text-[rgb(var(--text-muted))] mt-1 block">Air-Freight Crated</span>
                          </td>

                          {/* Client coordinates */}
                          <td className="p-4 space-y-1 text-[rgb(var(--text-secondary))]">
                            <p className="font-semibold text-[rgb(var(--foreground))] normal-case">{order.firstName} {order.lastName}</p>
                            <p className="text-[9px] lowercase tracking-normal">{order.email}</p>
                            <p className="text-[9px] tracking-wide text-[rgb(var(--text-muted))]">{order.phone}</p>
                            <p className="text-[8.5px] text-[rgb(var(--text-muted))] normal-case leading-normal">{order.address}, {order.city}, {order.state} {order.zip}</p>
                          </td>

                          {/* Order Date */}
                          <td className="p-4 text-[rgb(var(--text-secondary))]">{order.date.split(" at ")[0]}</td>

                          {/* Order Items */}
                          <td className="p-4 text-[9px] text-[rgb(var(--text-secondary))] max-w-[200px]">
                            <ul className="space-y-1.5 list-none">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between gap-4 font-light">
                                  <span className="text-left font-serif text-[10px] normal-case truncate">{item.name}</span>
                                  <span className="text-right shrink-0 text-[rgb(var(--text-muted))]">x{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Total Price */}
                          <td className="p-4 text-sm font-semibold text-[rgb(var(--foreground))]">
                            {formatPrice(order.total)}
                          </td>

                          {/* Fulfillment actions */}
                          <td className="p-4 pr-6">
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value as "Pending" | "Crating" | "Shipped" | "Delivered")}
                              className={`text-[9px] tracking-widest uppercase font-semibold border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] py-1 outline-none cursor-pointer focus:border-[rgb(var(--gold))] ${
                                order.status === "Pending" ? "text-amber-400" :
                                order.status === "Crating" ? "text-[#C5A880]" :
                                order.status === "Shipped" ? "text-blue-400" :
                                "text-green-400"
                              }`}
                            >
                              <option value="Pending" className="bg-[rgb(var(--background))] text-amber-400">Pending</option>
                              <option value="Crating" className="bg-[rgb(var(--background))] text-[#C5A880]">Crating</option>
                              <option value="Shipped" className="bg-[rgb(var(--background))] text-blue-400">Shipped</option>
                              <option value="Delivered" className="bg-[rgb(var(--background))] text-green-400">Delivered</option>
                            </select>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-[10px] text-[rgb(var(--text-muted))] tracking-widest uppercase">
                          No order transactions placed yet. Place test orders from checkout page.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: USER MANAGEMENT ─────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-up">

            {/* Search bar */}
            <div className="flex items-center gap-3 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl px-4 py-3 max-w-md">
              <Search size={14} className="text-[rgb(var(--text-muted))] shrink-0" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="bg-transparent text-[10px] tracking-wider text-[rgb(var(--foreground))] placeholder-[rgb(var(--text-muted))] outline-none w-full normal-case"
              />
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase text-[rgb(var(--text-muted))]"
            >
              <span>Total: <span className="text-[rgb(var(--foreground))] font-semibold">{users.length}</span></span>
              <span>Admins: <span className="text-[rgb(var(--gold))] font-semibold">{users.filter(u => u.role === "admin").length}</span></span>
              <span>Customers: <span className="text-[rgb(var(--foreground))] font-semibold">{users.filter(u => u.role === "customer").length}</span></span>
            </div>

            {/* Users Table */}
            <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px] tracking-widest uppercase">
                  <thead>
                    <tr className="border-b border-[rgb(var(--border))] bg-[rgba(var(--foreground),0.015)] text-[rgb(var(--text-muted))]">
                      <th className="p-4 pl-6 font-semibold">User</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Registered</th>
                      <th className="p-4 pr-6 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--border))]">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-[10px] text-[rgb(var(--text-muted))] tracking-widest uppercase">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.filter(u =>
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                      ).length ? (
                      users
                        .filter(u =>
                          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-[rgba(var(--foreground),0.005)] transition-colors">

                            {/* User name + avatar */}
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[rgb(var(--gold))]/10 border border-[rgb(var(--gold))]/20 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-semibold text-[rgb(var(--gold))]">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-[rgb(var(--foreground))] text-[11px] normal-case font-serif tracking-normal">{user.name}</p>
                                  <p className="text-[8px] text-[rgb(var(--text-muted))] tracking-widest">ID #{user.id}</p>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="p-4 text-[rgb(var(--text-secondary))] normal-case tracking-normal text-[9px]">{user.email}</td>

                            {/* Role badge + toggle */}
                            <td className="p-4">
                              <button
                                onClick={async () => {
                                  if (user.role === "admin" && !window.confirm("Demote this admin to customer?")) return;
                                  const storedUser = localStorage.getItem("shree_sai_user");
                                  const parsed = storedUser ? JSON.parse(storedUser) : null;
                                  const res = await fetch("/api/v1/admin/users", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${parsed?.token}` },
                                    body: JSON.stringify({ id: user.id, role: user.role === "admin" ? "customer" : "admin" })
                                  });
                                  if (res.ok) {
                                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: u.role === "admin" ? "customer" : "admin" } : u));
                                  }
                                }}
                                className={`text-[8px] px-2.5 py-1 rounded-full font-semibold border transition-all ${
                                  user.role === "admin"
                                    ? "bg-[rgb(var(--gold))]/10 text-[rgb(var(--gold))] border-[rgb(var(--gold))]/30 hover:bg-[rgb(var(--gold))]/20"
                                    : "bg-white/5 text-[rgb(var(--text-muted))] border-white/10 hover:border-white/30 hover:text-white"
                                }`}
                                title="Click to toggle role"
                              >
                                {user.role === "admin" ? "Admin" : "Customer"}
                              </button>
                            </td>

                            {/* Registered date */}
                            <td className="p-4 text-[rgb(var(--text-muted))] text-[9px]">
                              {new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>

                            {/* Delete action */}
                            <td className="p-4 pr-6 text-right">
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
                                  const storedUser = localStorage.getItem("shree_sai_user");
                                  const parsed = storedUser ? JSON.parse(storedUser) : null;
                                  const res = await fetch(`/api/v1/admin/users?id=${user.id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${parsed?.token}` }
                                  });
                                  if (res.ok) {
                                    setUsers(prev => prev.filter(u => u.id !== user.id));
                                  } else {
                                    const data = await res.json();
                                    alert(data.message || "Delete failed");
                                  }
                                }}
                                className="text-[rgb(var(--text-muted))] hover:text-red-400 transition-colors flex items-center gap-1.5 ml-auto"
                                title="Delete user"
                              >
                                <Trash2 size={13} />
                                <span className="text-[8px] tracking-widest">Delete</span>
                              </button>
                            </td>

                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-[10px] text-[rgb(var(--text-muted))] tracking-widest uppercase">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Add/Edit Product Modal Dialog Overlay ─────────────────── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[4px] p-4">
          <div className="w-full max-w-2xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-6 py-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[rgb(var(--gold))] font-medium block">
                  Catalog Inventory Entry
                </span>
                <h3 className="font-serif text-lg tracking-wider text-[rgb(var(--foreground))]">
                  {editingProduct ? `Edit Statement: ${editingProduct.name}` : "Create Statement Chandelier"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--foreground))] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-[10px] uppercase tracking-wider text-[rgb(var(--text-muted))]">
              
              {/* Product IDs & Slug & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block font-semibold">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="E.g. Aurelia Cascading Light"
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Product URL Slug (Auto-generated) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. aurelia-cascading-light"
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors cursor-pointer"
                  >
                    <option value="Chandelier" className="bg-[rgb(var(--background))]">Chandelier</option>
                    <option value="Indoor wall lamps" className="bg-[rgb(var(--background))]">Indoor wall lamps</option>
                    <option value="Linear lights" className="bg-[rgb(var(--background))]">Linear lights</option>
                    <option value="Ceiling lights" className="bg-[rgb(var(--background))]">Ceiling lights</option>
                    <option value="Internal pendant lights" className="bg-[rgb(var(--background))]">Internal pendant lights</option>
                    <option value="Outdoor wall lamps" className="bg-[rgb(var(--background))]">Outdoor wall lamps</option>
                  </select>
                </div>
              </div>

              {/* Pricing, Discount, Stock, Rating Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block font-semibold">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Mock Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block font-semibold">Product Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide luxury branding description of the design, craftsmanship, and light refractivity..."
                  className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-semibold">Dimensions (E.g. Diameter/Width/Height)</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Bulbs Spec (E.g. 4 x G9 LED Bulbs)</label>
                  <input
                    type="text"
                    value={formData.bulbs}
                    onChange={(e) => setFormData({ ...formData, bulbs: e.target.value })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Material (E.g. Solid Brass)</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Finish Options (E.g. Polished Brass, Matte Gold)</label>
                  <input
                    type="text"
                    value={formData.finish}
                    onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
              </div>

              {/* Images & Key Features */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold">Product Images *</label>
                    <label className="cursor-pointer text-[9px] uppercase tracking-wider text-[rgb(var(--gold))] hover:underline flex items-center gap-1 font-semibold">
                      <Upload size={12} />
                      {isUploadingImage ? "Uploading..." : "Upload Local Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Upload file drag/button zone */}
                  <div className="border border-dashed border-[rgb(var(--border))] rounded-lg p-3 bg-[rgb(var(--surface))] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[9px] text-[rgb(var(--text-muted))]">
                      <ImageIcon size={16} className="text-[rgb(var(--gold))]" />
                      <span>Select image file from computer/mobile to upload automatically</span>
                    </div>
                    <label className="px-3 py-1.5 bg-[rgb(var(--gold))]/10 border border-[rgb(var(--gold))]/30 text-[rgb(var(--gold))] hover:bg-[rgb(var(--gold))]/20 rounded text-[9px] font-semibold cursor-pointer shrink-0 transition-colors uppercase tracking-wider">
                      {isUploadingImage ? "Uploading..." : "Browse File"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Thumbnail preview of current images */}
                  {formData.images.split(",").map(i => i.trim()).filter(Boolean).length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {formData.images.split(",").map(i => i.trim()).filter(Boolean).map((imgUrl, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-[rgb(var(--border))] bg-black">
                          <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const list = formData.images.split(",").map(i => i.trim()).filter(Boolean);
                              const updated = list.filter((_, i) => i !== idx).join(", ");
                              setFormData(prev => ({ ...prev, images: updated }));
                            }}
                            className="absolute top-0.5 right-0.5 bg-red-600/90 text-white rounded-full p-0.5 opacity-80 hover:opacity-100 transition-opacity"
                            title="Remove Image"
                          >
                            <X size={10} />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[7px] text-center text-[rgb(var(--gold))] uppercase tracking-tighter py-0.5">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comma-separated Image URLs input (Manual / Edit) */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[8px] text-[rgb(var(--text-muted))]">Image URLs (comma-separated, first image is main thumbnail):</span>
                    <input
                      type="text"
                      required
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      placeholder="https://image1.jpg, /uploads/prod_123.jpg"
                      className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-semibold">Key Highlights / Features (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Individually hand-blown glass, Heavily weighted base, Brushed gold finishes"
                    className="w-full bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-[10px] tracking-wider uppercase text-[rgb(var(--foreground))] p-3 focus:outline-none focus:border-[rgb(var(--gold))]/60 transition-colors"
                  />
                </div>
              </div>

              {/* Modal Operations buttons */}
              <div className="flex items-center gap-3 pt-6 border-t border-[rgb(var(--border))] justify-end">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--foreground),0.03)] uppercase font-semibold transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="gold"
                  className="rounded-none px-6 font-semibold uppercase"
                >
                  {editingProduct ? "Save Changes" : "Create Product Entry"}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

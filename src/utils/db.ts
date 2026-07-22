import { PRODUCTS, Product } from "@/data/products";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  date: string;
  status: "Pending" | "Crating" | "Shipped" | "Delivered";
}

// Stored Products (Local Storage DB)
export const getStoredProducts = (): Product[] => {
  if (typeof window === "undefined") return PRODUCTS;
  const stored = localStorage.getItem("shree_sai_db_products");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored products", e);
    }
  }
  // Initialize on first call if not present
  if (typeof window !== "undefined") {
    localStorage.setItem("shree_sai_db_products", JSON.stringify(PRODUCTS));
  }
  return PRODUCTS;
};

export const saveStoredProducts = (products: Product[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("shree_sai_db_products", JSON.stringify(products));
  }
};

// Stored Orders (Local Storage DB)
export const getStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("shree_sai_db_orders");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored orders", e);
    }
  }
  return [];
};

export const saveStoredOrders = (orders: Order[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("shree_sai_db_orders", JSON.stringify(orders));
  }
};

export const addOrder = (order: Omit<Order, "status" | "date">): void => {
  const orders = getStoredOrders();
  const newOrder: Order = {
    ...order,
    status: "Pending",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
  };
  orders.unshift(newOrder);
  saveStoredOrders(orders);
};

export interface BackendVariant {
  _id?: string;
  title?: string;
  sku: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface BackendImage {
  url: string;
  key: string;
}

export interface BackendProduct {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  categoryIds?: Array<{ _id: string; name: string }>;
  variants?: BackendVariant[];
  fromPrice?: number;
  averageRating?: number;
  highlights?: string[];
  materials?: string[];
  finish?: string[];
  numberOfLights?: number;
  bulbType?: string;
  totalStock?: number;
  images?: BackendImage[];
  dimensions?: string;
  specifications?: Record<string, string>;
  relatedProductIds?: Array<string | { _id: string }>;
  warrantyMonths?: number;
  voltage?: string;
  totalWattage?: number;
  installationType?: string;
}

export const mapBackendProductToFrontend = (p: any): Product => {
  // Direct SQLite / Frontend format support
  if (typeof p.price === "number" && Array.isArray(p.images) && (p.images.length === 0 || typeof p.images[0] === "string")) {
    return {
      id: String(p.id || p._id || ""),
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      category: p.category || "Chandelier",
      price: p.price || 0,
      discount: p.discount || 0,
      rating: p.rating || 5.0,
      reviews: p.reviews || [],
      dimensions: p.dimensions || "",
      material: p.material || "",
      finish: p.finish || "",
      bulbs: p.bulbs || "",
      stock: typeof p.stock === "number" ? p.stock : 10,
      images: p.images || [],
      features: p.features || [],
      specifications: p.specifications || {},
      relatedProducts: p.relatedProducts || p.related_products || []
    };
  }

  const defaultVariant = p.variants?.find((v: any) => v.isDefault) || p.variants?.[0];
  
  // Calculate discount percentage based on compareAtPrice and price
  const currentPrice = defaultVariant?.price || p.fromPrice || p.price || 0;
  const originalPrice = defaultVariant?.compareAtPrice || currentPrice;
  const discount = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : (p.discount || 0);

  // Format dimensions
  let dimensions = "";
  if (p.dimensions && typeof p.dimensions === 'string') {
    dimensions = p.dimensions;
  }

  // Specifications
  const specifications: Record<string, string> = p.specifications || {};
  if (p.voltage) specifications["Voltage"] = p.voltage;
  if (p.totalWattage) specifications["Total Wattage"] = `${p.totalWattage}W`;
  if (p.warrantyMonths) specifications["Warranty"] = `${p.warrantyMonths} Months`;
  if (p.installationType) specifications["Installation"] = p.installationType;
  if (p.numberOfLights) specifications["Number of Lights"] = String(p.numberOfLights);

  return {
    id: p._id ? p._id.toString() : String(p.id || ""),
    name: p.name || "",
    slug: p.slug || "",
    description: p.description || "",
    category: p.categoryIds?.[0]?.name || p.category || "Chandelier",
    price: currentPrice,
    discount: discount,
    rating: p.averageRating || p.rating || 5.0,
    reviews: [],
    dimensions: dimensions,
    material: Array.isArray(p.materials) ? p.materials.join(", ") : (p.material || ""),
    finish: Array.isArray(p.finish) ? p.finish.join(", ") : (p.finish || ""),
    bulbs: p.bulbs || (p.numberOfLights ? `${p.numberOfLights} x ${p.bulbType?.toUpperCase() || "LED"}` : "Integrated LED"),
    stock: p.totalStock || p.stock || 0,
    images: Array.isArray(p.images) ? p.images.map((img: any) => typeof img === "string" ? img : img.url) : [],
    features: p.highlights || p.features || [],
    specifications: specifications,
    relatedProducts: p.relatedProductIds?.map((rp: any) => typeof rp === "object" ? (rp._id ? rp._id.toString() : rp.toString()) : rp.toString()) || p.related_products || [],
    defaultVariantId: defaultVariant?._id ? defaultVariant._id.toString() : ""
  };
};

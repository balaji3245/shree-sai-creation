import { PRODUCTS, Product, Review } from "@/data/products";

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

export const mapBackendProductToFrontend = (p: Record<string, unknown>): Product => {
  // Direct SQLite / Frontend format support
  if (typeof p.price === "number" && Array.isArray(p.images) && (p.images.length === 0 || typeof p.images[0] === "string")) {
    return {
      id: String(p.id || p._id || ""),
      name: (p.name as string) || "",
      slug: (p.slug as string) || "",
      description: (p.description as string) || "",
      category: (p.category as string) || "Chandelier",
      price: (p.price as number) || 0,
      discount: (p.discount as number) || 0,
      rating: (p.rating as number) || 5.0,
      reviews: (p.reviews as Review[]) || [],
      dimensions: (p.dimensions as string) || "",
      material: (p.material as string) || "",
      finish: (p.finish as string) || "",
      bulbs: (p.bulbs as string) || "",
      stock: typeof p.stock === "number" ? p.stock : 10,
      images: (p.images as string[]) || [],
      features: (p.features as string[]) || [],
      specifications: (p.specifications as Record<string, string>) || {},
      relatedProducts: (p.relatedProducts as string[]) || (p.related_products as string[]) || []
    };
  }

  const variants = p.variants as Record<string, unknown>[] | undefined;
  const defaultVariant = variants?.find((v) => v.isDefault) || variants?.[0];
  
  // Calculate discount percentage based on compareAtPrice and price
  const currentPrice = (defaultVariant?.price as number) || (p.fromPrice as number) || (p.price as number) || 0;
  const originalPrice = (defaultVariant?.compareAtPrice as number) || currentPrice;
  const discount = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : ((p.discount as number) || 0);

  // Format dimensions
  let dimensions = "";
  if (p.dimensions && typeof p.dimensions === 'string') {
    dimensions = p.dimensions;
  }

  // Specifications
  const specifications: Record<string, string> = (p.specifications as Record<string, string>) || {};
  if (p.voltage) specifications["Voltage"] = String(p.voltage);
  if (p.totalWattage) specifications["Total Wattage"] = `${p.totalWattage}W`;
  if (p.warrantyMonths) specifications["Warranty"] = `${p.warrantyMonths} Months`;
  if (p.installationType) specifications["Installation"] = String(p.installationType);
  if (p.numberOfLights) specifications["Number of Lights"] = String(p.numberOfLights);

  const categoryIds = p.categoryIds as Array<{ name: string }> | undefined;
  const materials = p.materials as string[] | undefined;
  const finish = p.finish as string[] | undefined;
  const images = p.images as Array<string | { url: string }> | undefined;
  const relatedProductIds = p.relatedProductIds as Array<unknown> | undefined;

  return {
    id: p._id ? String(p._id) : String(p.id || ""),
    name: (p.name as string) || "",
    slug: (p.slug as string) || "",
    description: (p.description as string) || "",
    category: categoryIds?.[0]?.name || (p.category as string) || "Chandelier",
    price: currentPrice,
    discount: discount,
    rating: (p.averageRating as number) || (p.rating as number) || 5.0,
    reviews: [],
    dimensions: dimensions,
    material: Array.isArray(materials) ? materials.join(", ") : ((p.material as string) || ""),
    finish: Array.isArray(finish) ? finish.join(", ") : ((p.finish as string) || ""),
    bulbs: (p.bulbs as string) || (p.numberOfLights ? `${p.numberOfLights} x ${String(p.bulbType || "LED").toUpperCase()}` : "Integrated LED"),
    stock: (p.totalStock as number) || (p.stock as number) || 0,
    images: Array.isArray(images) ? images.map((img) => typeof img === "string" ? img : img.url) : [],
    features: (p.highlights as string[]) || (p.features as string[]) || [],
    specifications: specifications,
    relatedProducts: relatedProductIds?.map((rp) => typeof rp === "object" && rp && "_id" in rp ? String((rp as { _id: unknown })._id) : String(rp)) || (p.related_products as string[]) || [],
    defaultVariantId: defaultVariant?._id ? String(defaultVariant._id) : ""
  };
};

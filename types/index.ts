export interface ProductCategory { id: string; name: string; slug: string; description: string; image: string; }
export interface Product { id: string; slug: string; name: string; category: string; description: string; image: string; images: string[]; dimensions: string; material: string; finish: string; space: string; style: string; featured?: boolean; }
export interface Project { slug: string; title: string; type: string; location: string; description: string; image: string; products: string; }
export interface Testimonial { quote: string; name: string; role: string; }
export interface BlogPost { slug: string; title: string; excerpt: string; category: string; date: string; image: string; }
export interface FAQ { question: string; answer: string; }
export interface NavigationItem { label: string; href: string; }
export interface SiteSettings { phone: string; email: string; address: string; whatsapp: string; serviceArea: string; }

import { categories, faqs, navigation, posts, products, projects, settings, testimonials } from '@/data/site-data';
import type { BlogPost, Product, ProductCategory, Project } from '@/types';

export interface ContentRepository {
  getSettings(): Promise<typeof settings>;
  getNavigation(): Promise<typeof navigation>;
  getCategories(): Promise<ProductCategory[]>;
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | null>;
  getProjects(type?: string): Promise<Project[]>;
  getPosts(): Promise<BlogPost[]>;
  getPost(slug: string): Promise<BlogPost | null>;
  getHomeContent(): Promise<HomeContent>;
}

export type ProductFilters = { query?: string; category?: string; style?: string; space?: string };
export type HomeContent = { categories: ProductCategory[]; featuredProducts: Product[]; projects: Project[]; testimonials: typeof testimonials; faqs: typeof faqs };

const normalise = (value = '') => value.trim().toLowerCase();

export const contentRepository: ContentRepository = {
  async getSettings() { return settings; },
  async getNavigation() { return navigation; },
  async getCategories() { return categories; },
  async getProducts(filters = {}) {
    const query = normalise(filters.query);
    return products.filter((product) => {
      const searchable = `${product.name} ${product.description} ${product.category} ${product.style} ${product.space}`.toLowerCase();
      return (!query || searchable.includes(query))
        && (!filters.category || filters.category === 'All' || product.category === filters.category)
        && (!filters.style || product.style === filters.style)
        && (!filters.space || product.space === filters.space);
    });
  },
  async getProduct(slug) { return products.find((product) => product.slug === slug) ?? null; },
  async getProjects(type) { return projects.filter((project) => !type || type === 'All' || project.type === type); },
  async getPosts() { return posts; },
  async getPost(slug) { return posts.find((post) => post.slug === slug) ?? null; },
  async getHomeContent() { return { categories, featuredProducts: products.filter((product) => product.featured), projects, testimonials, faqs }; },
};

export const getSettings = () => contentRepository.getSettings();
export const getNavigation = () => contentRepository.getNavigation();
export const getCategories = () => contentRepository.getCategories();
export const getProducts = (filters?: ProductFilters) => contentRepository.getProducts(filters);
export const getProduct = (slug: string) => contentRepository.getProduct(slug);
export const getProjects = (type?: string) => contentRepository.getProjects(type);
export const getPosts = () => contentRepository.getPosts();
export const getPost = (slug: string) => contentRepository.getPost(slug);
export const getHomeContent = () => contentRepository.getHomeContent();

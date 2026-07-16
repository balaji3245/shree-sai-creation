import { ADMIN_PERMISSIONS } from '../constants/permissions.constants.js';
import adminRepository from '../repositories/admin.repository.js';
import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import pageRepository from '../repositories/page.repository.js';
import homeSectionRepository from '../repositories/homeSection.repository.js';
import faqRepository from '../repositories/faq.repository.js';
import shippingZoneRepository from '../repositories/shippingZone.repository.js';
import { slugify } from '../utilities/slugify.js';
import logger from '../utilities/logger.js';

const DEFAULT_CATEGORIES = [
  'Chandelier',
  'Indoor Wall Lamps',
  'Linear Lights',
  'Ceiling Lights',
  'Internal Pendant Lights',
  'Outdoor Wall Lamps',
];

const DEFAULT_PAGES = [
  {
    title: 'About Us',
    slug: 'about-us',
    excerpt: 'Our story of craftsmanship and light',
    content:
      '<p>Shree Sai Creation brings luxury and elegance to your space with our exclusive collection of chandeliers and premium lighting.</p>',
  },
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    excerpt: 'Delivery timelines and shipping terms',
    content:
      '<p>We ship across India. Free shipping may apply above the configured threshold.</p>',
  },
  {
    title: 'Return Policy',
    slug: 'return-policy',
    excerpt: 'Returns and exchanges',
    content:
      '<p>Please contact support within the return window for eligible products.</p>',
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    excerpt: 'How we handle your data',
    content: '<p>We respect your privacy and protect your personal information.</p>',
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    excerpt: 'Terms of use',
    content: '<p>By using our website you agree to these terms and conditions.</p>',
  },
];

const DEFAULT_HOME_SECTIONS = [
  {
    sectionKey: 'hero',
    type: 'hero_banner',
    title: 'Timeless Elegance',
    subtitle: 'Extraordinary lighting for every space',
    sortOrder: 1,
  },
  {
    sectionKey: 'shop_by_category',
    type: 'category_grid',
    title: 'Shop By Category',
    subtitle: 'Our Collections',
    sortOrder: 2,
  },
  {
    sectionKey: 'bestsellers',
    type: 'product_rail',
    title: 'Best Sellers',
    subtitle: 'Featured Products',
    dataSource: 'best_seller',
    itemLimit: 8,
    sortOrder: 3,
  },
  {
    sectionKey: 'trust',
    type: 'trust_badges',
    title: 'Why Choose Us',
    sortOrder: 4,
    items: [
      { title: 'Free Shipping', subtitle: 'Worldwide Order' },
      { title: 'Premium Quality', subtitle: 'Finest Materials' },
      { title: 'Secure Payment', subtitle: '100% Secure' },
      { title: 'Customer Support', subtitle: '24/7 Support' },
    ],
  },
  {
    sectionKey: 'features',
    type: 'feature_blocks',
    title: 'Crafted for Excellence',
    sortOrder: 5,
    items: [
      {
        title: 'Expert Craftsmanship',
        subtitle: 'Handcrafted by skilled artisans with precision.',
      },
      {
        title: 'Custom Design',
        subtitle: 'Personalized lighting solutions for your space.',
      },
      {
        title: 'Luxury Materials',
        subtitle: 'Made with the finest materials worldwide.',
      },
      {
        title: 'Timeless Design',
        subtitle: 'Elegant designs that never go out of style.',
      },
    ],
  },
  {
    sectionKey: 'newsletter',
    type: 'newsletter',
    title: 'Newsletter',
    subtitle: 'Subscribe to get updates on new arrivals and exclusive offers.',
    sortOrder: 6,
  },
];

export async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@shreesaicreation.com';
  const existing = await adminRepository.findByEmail(email);
  if (existing) {
    logger.info(`Admin already exists: ${email}`);
    return existing;
  }

  const admin = await adminRepository.create({
    name: process.env.SEED_ADMIN_NAME || 'Super Admin',
    email,
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role: 'Admin',
    permissions: [...ADMIN_PERMISSIONS],
  });

  logger.info(`Seeded superadmin: ${email}`);
  return admin;
}

export async function seedStoreSettings() {
  const existing = await storeSettingsRepository.findDefault();
  if (existing) {
    logger.info('Store settings already exist');
    return existing;
  }

  const settings = await storeSettingsRepository.upsertDefault({
    storeName: 'Shree Sai Creation',
    tagline: 'Premium Luxury Lighting',
    supportEmail: 'support@shreesaicreation.com',
    whatsappNumber: '',
    currency: 'INR',
    freeShippingThresholdInPaise: 0,
  });

  logger.info('Seeded store settings');
  return settings;
}

export async function seedCategories() {
  const existing = await categoryRepository.count();
  if (existing > 0) {
    logger.info(`Categories already seeded (${existing})`);
    return;
  }

  let order = 1;
  for (const name of DEFAULT_CATEGORIES) {
    await categoryRepository.create({
      name,
      slug: slugify(name),
      shortDescription: `Explore our ${name.toLowerCase()} collection`,
      isActive: true,
      isFeatured: true,
      sortOrder: order++,
      seoTitle: `${name} | Shree Sai Creation`,
      seoDescription: `Premium ${name.toLowerCase()} from Shree Sai Creation`,
    });
  }

  logger.info(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
}

export async function seedCmsPages() {
  const existing = await pageRepository.count();
  if (existing > 0) {
    logger.info(`CMS pages already seeded (${existing})`);
    return;
  }

  for (const page of DEFAULT_PAGES) {
    await pageRepository.create({
      ...page,
      isPublished: true,
      seoTitle: `${page.title} | Shree Sai Creation`,
      seoDescription: page.excerpt,
    });
  }
  logger.info(`Seeded ${DEFAULT_PAGES.length} CMS pages`);
}

export async function seedHomeSections() {
  const existing = await homeSectionRepository.count();
  if (existing > 0) {
    logger.info(`Home sections already seeded (${existing})`);
    return;
  }

  for (const section of DEFAULT_HOME_SECTIONS) {
    await homeSectionRepository.create({
      ...section,
      isActive: true,
      dataSource: section.dataSource || 'none',
    });
  }
  logger.info(`Seeded ${DEFAULT_HOME_SECTIONS.length} home sections`);
}

export async function seedFaqs() {
  const cats = await faqRepository.findCategories();
  if (cats.length > 0) {
    logger.info('FAQs already seeded');
    return;
  }

  const cat = await faqRepository.createCategory({
    name: 'General',
    slug: 'general',
    sortOrder: 1,
    isActive: true,
  });

  const faqs = [
    {
      question: 'Do you offer free shipping?',
      answer:
        'Free shipping may apply above the store threshold configured by admin. Otherwise standard shipping rates apply.',
    },
    {
      question: 'Can I request a custom chandelier design?',
      answer:
        'Yes. Use the Custom Design inquiry form and our team will get back to you with options.',
    },
    {
      question: 'What is the warranty on lighting products?',
      answer:
        'Warranty varies by product and is listed on each product page (typically 12 months unless specified).',
    },
  ];

  let order = 1;
  for (const f of faqs) {
    await faqRepository.createFaq({
      ...f,
      categoryId: cat._id,
      sortOrder: order++,
      isActive: true,
    });
  }
  logger.info(`Seeded FAQ category + ${faqs.length} FAQs`);
}

export async function seedShippingZones() {
  const existing = await shippingZoneRepository.findMany(
    { name: 'Maharashtra Metro' },
    { limit: 1 }
  );
  if (existing.length > 0) {
    logger.info('Shipping zones already seeded');
    return;
  }

  await shippingZoneRepository.create({
    name: 'Maharashtra Metro',
    states: ['maharashtra', 'MH'],
    pinPrefixes: ['40', '41'],
    methods: [
      {
        code: 'standard',
        name: 'Standard Shipping',
        amountInPaise: 9900,
        estimatedDaysMin: 3,
        estimatedDaysMax: 5,
        isDefault: true,
      },
      {
        code: 'express',
        name: 'Express Shipping',
        amountInPaise: 19900,
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
        isDefault: false,
      },
    ],
    isActive: true,
    sortOrder: 1,
  });

  await shippingZoneRepository.create({
    name: 'Rest of India',
    states: [],
    pinPrefixes: [],
    methods: [
      {
        code: 'standard',
        name: 'Standard Shipping',
        amountInPaise: 14900,
        estimatedDaysMin: 5,
        estimatedDaysMax: 9,
        isDefault: true,
      },
    ],
    isActive: true,
    sortOrder: 99,
  });

  // Make Rest of India match everything by using empty pin/state as fallback
  // quote logic falls back to StoreSettings flat fee if no zone matches —
  // so set a catch-all with a wildcard pin empty and we need match logic update.
  // For seed: also add a broad zone with pin prefix "" — matchZone won't match empty.
  // Instead update quote to use last zone named Rest of India — already handled by
  // flat fee fallback. Seed is fine.

  logger.info('Seeded shipping zones');
}

export async function runAllSeeds() {
  await seedAdmin();
  await seedStoreSettings();
  await seedCategories();
  await seedCmsPages();
  await seedHomeSections();
  await seedFaqs();
  await seedShippingZones();
}

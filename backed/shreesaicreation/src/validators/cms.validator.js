import Joi from 'joi';
import {
  HOME_SECTION_TYPES,
  BANNER_LINK_TYPES,
  INQUIRY_TYPES,
  INQUIRY_STATUSES,
} from '../constants/cms.constants.js';

export const bannerSchema = Joi.object({
  title: Joi.string().allow('').default(''),
  subtitle: Joi.string().allow('').default(''),
  imageDesktop: Joi.string().required(),
  imageMobile: Joi.string().allow('', null),
  ctaText: Joi.string().allow('').default(''),
  linkType: Joi.string()
    .valid(...BANNER_LINK_TYPES)
    .default('none'),
  linkValue: Joi.string().allow('').default(''),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
  activeFrom: Joi.date().allow(null),
  activeUntil: Joi.date().allow(null),
  placement: Joi.string()
    .valid('home_hero', 'home_promo', 'category', 'global')
    .default('home_hero'),
});

export const bannerUpdateSchema = bannerSchema.fork(['imageDesktop'], (s) =>
  s.optional()
);

export const homeSectionSchema = Joi.object({
  sectionKey: Joi.string().trim().required(),
  type: Joi.string()
    .valid(...HOME_SECTION_TYPES)
    .required(),
  title: Joi.string().allow('').default(''),
  subtitle: Joi.string().allow('').default(''),
  dataSource: Joi.string()
    .valid(
      'featured',
      'best_seller',
      'new_arrival',
      'category',
      'collection',
      'custom',
      'none'
    )
    .default('none'),
  sourceId: Joi.string().hex().length(24).allow(null),
  customProductIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .default([]),
  itemLimit: Joi.number().integer().min(1).max(48).default(8),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
  displayConfig: Joi.object().unknown(true).default({}),
  items: Joi.array().items(Joi.object().unknown(true)).default([]),
  htmlContent: Joi.string().allow('').default(''),
  ctaText: Joi.string().allow('').default(''),
  ctaLink: Joi.string().allow('').default(''),
  imageUrl: Joi.string().allow('', null),
});

export const homeSectionUpdateSchema = homeSectionSchema.fork(
  ['sectionKey', 'type'],
  (s) => s.optional()
);

export const homeReorderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().hex().length(24).required(),
        sortOrder: Joi.number().integer().required(),
      })
    )
    .min(1)
    .required(),
});

export const pageSchema = Joi.object({
  title: Joi.string().trim().required(),
  slug: Joi.string().trim().allow('', null),
  content: Joi.string().allow('').default(''),
  excerpt: Joi.string().allow('').default(''),
  seoTitle: Joi.string().allow('').default(''),
  seoDescription: Joi.string().allow('').default(''),
  seoKeywords: Joi.array().items(Joi.string()).default([]),
  isPublished: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().default(0),
});

export const pageUpdateSchema = pageSchema.fork(['title'], (s) => s.optional());

export const faqCategorySchema = Joi.object({
  name: Joi.string().trim().required(),
  slug: Joi.string().trim().allow('', null),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
});

export const faqSchema = Joi.object({
  question: Joi.string().trim().required(),
  answer: Joi.string().required(),
  categoryId: Joi.string().hex().length(24).allow(null),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
});

export const faqUpdateSchema = faqSchema.fork(['question', 'answer'], (s) =>
  s.optional()
);

export const inquirySchema = Joi.object({
  type: Joi.string()
    .valid(...INQUIRY_TYPES)
    .default('contact'),
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('').default(''),
  subject: Joi.string().allow('').default(''),
  message: Joi.string().required(),
  roomType: Joi.string().allow('').default(''),
  budgetRange: Joi.string().allow('').default(''),
  preferredStyle: Joi.string().allow('').default(''),
  dimensions: Joi.string().allow('').default(''),
  attachmentUrls: Joi.array().items(Joi.string().uri()).default([]),
});

export const inquiryUpdateSchema = Joi.object({
  status: Joi.string().valid(...INQUIRY_STATUSES),
  adminNotes: Joi.string().allow(''),
  assignedTo: Joi.string().hex().length(24).allow(null),
}).min(1);

export const newsletterSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().allow('').default(''),
  source: Joi.string().allow('').default('website'),
});

export const wishlistMoveSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  variantId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export const storeSettingsUpdateSchema = Joi.object({
  storeName: Joi.string(),
  tagline: Joi.string().allow(''),
  supportEmail: Joi.string().email().allow(''),
  supportPhone: Joi.string().allow(''),
  whatsappNumber: Joi.string().allow(''),
  gstin: Joi.string().allow(''),
  stateCode: Joi.string().allow(''),
  address: Joi.object({
    line1: Joi.string().allow(''),
    line2: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    pincode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }),
  currency: Joi.string(),
  freeShippingThresholdInPaise: Joi.number().integer().min(0),
  flatShippingFeeInPaise: Joi.number().integer().min(0),
  social: Joi.object({
    instagram: Joi.string().allow(''),
    facebook: Joi.string().allow(''),
    youtube: Joi.string().allow(''),
  }),
  logoUrl: Joi.string().allow('', null),
}).min(1);

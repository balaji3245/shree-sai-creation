import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const categoryCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string().trim().allow('', null),
  description: Joi.string().allow('').default(''),
  shortDescription: Joi.string().allow('').default(''),
  image: Joi.object().unknown(true).allow(null),
  bannerImage: Joi.object().unknown(true).allow(null),
  parentId: Joi.string().hex().length(24).allow(null),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  seoTitle: Joi.string().allow('').default(''),
  seoDescription: Joi.string().allow('').default(''),
  seoKeywords: Joi.array().items(Joi.string()).default([]),
});

export const categoryUpdateSchema = categoryCreateSchema.fork(
  ['name'],
  (s) => s.optional()
);

export const categoryReorderSchema = Joi.object({
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

export const collectionCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string().trim().allow('', null),
  description: Joi.string().allow('').default(''),
  image: Joi.object().unknown(true).allow(null),
  productIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  sortOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
  seoTitle: Joi.string().allow('').default(''),
  seoDescription: Joi.string().allow('').default(''),
  seoKeywords: Joi.array().items(Joi.string()).default([]),
});

export const collectionUpdateSchema = collectionCreateSchema.fork(
  ['name'],
  (s) => s.optional()
);

const variantSchema = Joi.object({
  title: Joi.string().allow(''),
  variantName: Joi.string().allow(''),
  sku: Joi.string().trim().required(),
  barcode: Joi.string().allow('', null),
  options: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
  price: Joi.number().min(0),
  priceInPaise: Joi.number().integer().min(0),
  compareAtPrice: Joi.number().min(0).allow(null),
  compareAtPriceInPaise: Joi.number().integer().min(0).allow(null),
  costPrice: Joi.number().min(0).allow(null),
  costPriceInPaise: Joi.number().integer().min(0).allow(null),
  stock: Joi.number().integer().min(0).default(0),
  trackInventory: Joi.boolean().default(true),
  allowBackorder: Joi.boolean().default(false),
  lowStockThreshold: Joi.number().integer().min(0).default(2),
  images: Joi.array().items(Joi.object().unknown(true)).default([]),
  dimensions: Joi.object().unknown(true).default({}),
  package: Joi.object().unknown(true).default({}),
  weightKg: Joi.number().min(0).allow(null),
  isDefault: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  position: Joi.number().integer().default(0),
}).or('price', 'priceInPaise');

export const productCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  slug: Joi.string().trim().allow('', null),
  hsnCode: Joi.string().allow('').default('9405'),
  brand: Joi.string().default('Shree Sai Creation'),
  categoryIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  collectionIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  visibility: Joi.string().valid('public', 'hidden').default('public'),
  shortDescription: Joi.string().allow('').default(''),
  description: Joi.string().allow('').default(''),
  highlights: Joi.array().items(Joi.string()).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  taxPercent: Joi.number().min(0).max(100).default(18),
  isTaxInclusive: Joi.boolean().default(true),
  optionDefinitions: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        values: Joi.array().items(Joi.string()).default([]),
      })
    )
    .default([]),
  // Single-SKU shorthand (auto Default variant)
  sku: Joi.string().trim(),
  price: Joi.number().min(0),
  priceInPaise: Joi.number().integer().min(0),
  compareAtPrice: Joi.number().min(0).allow(null),
  compareAtPriceInPaise: Joi.number().integer().min(0).allow(null),
  costPrice: Joi.number().min(0).allow(null),
  costPriceInPaise: Joi.number().integer().min(0).allow(null),
  stock: Joi.number().integer().min(0),
  trackInventory: Joi.boolean(),
  allowBackorder: Joi.boolean(),
  lowStockThreshold: Joi.number().integer().min(0),
  barcode: Joi.string().allow('', null),
  variants: Joi.array().items(variantSchema).min(1),
  productType: Joi.string(),
  style: Joi.array().items(Joi.string()).default([]),
  mountType: Joi.string(),
  roomTypes: Joi.array().items(Joi.string()).default([]),
  materials: Joi.array().items(Joi.string()).default([]),
  finish: Joi.array().items(Joi.string()).default([]),
  primaryColor: Joi.string().allow('').default(''),
  bulbType: Joi.string(),
  bulbIncluded: Joi.boolean().default(false),
  numberOfLights: Joi.number().integer().min(0).allow(null),
  maxWattage: Joi.number().allow(null),
  totalWattage: Joi.number().allow(null),
  voltage: Joi.string().default('220-240V'),
  colorTemperature: Joi.array().items(Joi.string()).default([]),
  lumens: Joi.number().allow(null),
  cri: Joi.number().allow(null),
  dimmable: Joi.boolean().default(false),
  dimmerType: Joi.string().allow('', null),
  ipRating: Joi.string().allow('', null),
  energyRating: Joi.string().allow('', null),
  heightCm: Joi.number().allow(null),
  widthCm: Joi.number().allow(null),
  depthCm: Joi.number().allow(null),
  diameterCm: Joi.number().allow(null),
  canopyDiameterCm: Joi.number().allow(null),
  minDropCm: Joi.number().allow(null),
  maxDropCm: Joi.number().allow(null),
  chainLengthCm: Joi.number().allow(null),
  weightKg: Joi.number().allow(null),
  installationType: Joi.string(),
  assemblyRequired: Joi.boolean().default(true),
  certified: Joi.array().items(Joi.string()).default([]),
  warrantyMonths: Joi.number().integer().default(12),
  careInstructions: Joi.string().allow('').default(''),
  installationNotes: Joi.string().allow('').default(''),
  customizationAvailable: Joi.boolean().default(false),
  customizationNotes: Joi.string().allow('').default(''),
  images: Joi.array().items(Joi.object().unknown(true)).default([]),
  lifestyleImages: Joi.array().items(Joi.object().unknown(true)).default([]),
  videos: Joi.array().items(Joi.object().unknown(true)).default([]),
  brochurePdf: Joi.object().unknown(true).allow(null),
  sizeGuideImage: Joi.object().unknown(true).allow(null),
  isFeatured: Joi.boolean().default(false),
  isBestSeller: Joi.boolean().default(false),
  isNewArrival: Joi.boolean().default(false),
  isCustomOrder: Joi.boolean().default(false),
  leadTimeDays: Joi.number().integer().min(0).default(0),
  sortOrder: Joi.number().integer().default(0),
  relatedProductIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  seoTitle: Joi.string().allow('').default(''),
  seoDescription: Joi.string().allow('').default(''),
  seoKeywords: Joi.array().items(Joi.string()).default([]),
}).custom((value, helpers) => {
  const hasVariants = Array.isArray(value.variants) && value.variants.length > 0;
  if (!hasVariants) {
    if (!value.sku) {
      return helpers.error('any.custom', {
        message: 'sku is required when variants are not provided',
      });
    }
    if (value.price === undefined && value.priceInPaise === undefined) {
      return helpers.error('any.custom', {
        message: 'price or priceInPaise is required when variants are not provided',
      });
    }
  }
  return value;
}, 'default variant shorthand').messages({
  'any.custom': '{{#message}}',
});

export { productUpdateSchema } from './productUpdate.validator.js';

export const productStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'published', 'archived').required(),
});

export const variantCreateSchema = variantSchema;
export const variantUpdateSchema = variantSchema.fork(['sku'], (s) => s.optional()).keys({
  price: Joi.number().min(0),
  priceInPaise: Joi.number().integer().min(0),
}).or('price', 'priceInPaise', 'title', 'stock', 'sku', 'isDefault', 'isActive');

export const mediaAttachSchema = Joi.object({
  images: Joi.array().items(Joi.object().unknown(true)),
  lifestyleImages: Joi.array().items(Joi.object().unknown(true)),
  videos: Joi.array().items(Joi.object().unknown(true)),
  brochurePdf: Joi.object().unknown(true).allow(null),
});

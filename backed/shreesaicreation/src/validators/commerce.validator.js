import Joi from 'joi';

export const userRegisterSchema = Joi.object({
  name: Joi.string().trim().allow('').default(''),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow('', null),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().trim().allow(''),
  phone: Joi.string().allow('', null),
}).min(1);

export const addressSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().allow('', null),
  line1: Joi.string().trim().required(),
  line2: Joi.string().allow('').default(''),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  country: Joi.string().default('IN'),
  isDefault: Joi.boolean().default(false),
  label: Joi.string().default('Home'),
});

export const addressUpdateSchema = addressSchema.fork(
  ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'],
  (s) => s.optional()
).min(1);

export const cartAddSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  variantId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export const cartUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

export const couponApplySchema = Joi.object({
  code: Joi.string().trim().required(),
});

export const couponCreateSchema = Joi.object({
  code: Joi.string().trim().required(),
  description: Joi.string().allow('').default(''),
  discountType: Joi.string().valid('percentage', 'flat').required(),
  discountValue: Joi.number().min(0),
  discountInPercentage: Joi.number().min(0).max(100),
  flatDiscount: Joi.number().min(0),
  discountValueInPaise: Joi.number().integer().min(0),
  maxDiscount: Joi.number().min(0).allow(null),
  maxDiscountInPaise: Joi.number().integer().min(0).allow(null),
  minCart: Joi.number().min(0),
  minCartInPaise: Joi.number().integer().min(0),
  startDate: Joi.date().allow(null),
  expiryDate: Joi.date().allow(null),
  usageLimit: Joi.number().integer().min(1).allow(null),
  perUserLimit: Joi.number().integer().min(1).default(1),
  firstOrderOnly: Joi.boolean().default(false),
  freeShipping: Joi.boolean().default(false),
  productIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  categoryIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  disabled: Joi.boolean().default(false),
});

export const checkoutCreateSchema = Joi.object({
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  shippingAddress: addressSchema.required(),
  billingAddress: addressSchema.optional().allow(null),
  createAccount: Joi.boolean().default(false),
});

export const checkoutConfirmSchema = Joi.object({
  orderNumber: Joi.string().required(),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().allow('', null),
});

export const orderCancelSchema = Joi.object({
  reason: Joi.string().allow('').default(''),
});

export const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'paid',
      'processing',
      'packed',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'refunded',
      'on_hold'
    )
    .required(),
  note: Joi.string().allow('').default(''),
  trackingNumber: Joi.string().allow('', null),
  trackingUrl: Joi.string().uri().allow('', null),
  carrier: Joi.string().allow('', null),
});

export const orderRefundSchema = Joi.object({
  amountInPaise: Joi.number().integer().min(1).allow(null),
  amount: Joi.number().min(0).allow(null),
  note: Joi.string().allow('').default(''),
});

export const shipmentSchema = Joi.object({
  trackingNumber: Joi.string().required(),
  trackingUrl: Joi.string().allow('', null),
  carrier: Joi.string().allow('', null),
  note: Joi.string().allow('').default(''),
});

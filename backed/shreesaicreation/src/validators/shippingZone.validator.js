import Joi from 'joi';

export const shippingZoneSchema = Joi.object({
  name: Joi.string().trim().required(),
  states: Joi.array().items(Joi.string()).default([]),
  pinPrefixes: Joi.array().items(Joi.string()).default([]),
  methods: Joi.array()
    .items(
      Joi.object({
        code: Joi.string().allow(''),
        name: Joi.string().required(),
        amount: Joi.number().min(0),
        amountInPaise: Joi.number().integer().min(0),
        estimatedDaysMin: Joi.number().integer().min(1).default(3),
        estimatedDaysMax: Joi.number().integer().min(1).default(7),
        isDefault: Joi.boolean().default(false),
      }).or('amount', 'amountInPaise')
    )
    .min(1)
    .required(),
  isActive: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().default(0),
});

export const shippingZoneUpdateSchema = shippingZoneSchema.fork(
  ['name', 'methods'],
  (s) => s.optional()
);

export const shippingQuoteSchema = Joi.object({
  state: Joi.string().allow(''),
  pincode: Joi.string().allow(''),
  city: Joi.string().allow(''),
});

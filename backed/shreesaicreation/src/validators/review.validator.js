import Joi from 'joi';

export const reviewCreateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().allow('').default(''),
  body: Joi.string().allow('').default(''),
});

export const reviewModerateSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'pending').required(),
  adminNote: Joi.string().allow('').default(''),
});

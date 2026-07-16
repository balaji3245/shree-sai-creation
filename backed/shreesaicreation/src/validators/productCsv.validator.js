import Joi from 'joi';

export const relatedProductsSchema = Joi.object({
  relatedProductIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .default([]),
});

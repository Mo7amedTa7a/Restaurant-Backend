import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(0).required(),
  discount: Joi.number().min(0).optional(),
  preparationTime: Joi.string().required(),
  categoryId: Joi.string().hex().length(24).required(), 
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10),
  price: Joi.number().min(0),
  discount: Joi.number().min(0),
  preparationTime: Joi.string(),
  categoryId: Joi.string().hex().length(24),
});
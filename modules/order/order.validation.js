import Joi from "joi";

export const createCashOrderSchema = Joi.object({

  shippingAddress: Joi.object({
    phone: Joi.string().min(10).max(20).required(),
    street: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
  }).required(),
});

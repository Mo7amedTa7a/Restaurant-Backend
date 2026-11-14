import Joi from "joi";

export const createCouponVal = Joi.object({
  code: Joi.string().trim().min(3).max(20).required().messages({
    "string.empty": "Coupon code cannot be empty",
    "string.min": "Coupon code must be at least 3 characters long",
    "any.required": "Coupon code is required"
  }),
  
  discount: Joi.number().min(1).max(100).required().messages({
    "number.min": "Discount must be at least 1%",
    "number.max": "Discount cannot exceed 100%",
    "any.required": "Discount value is required"
  }),
  
  expires: Joi.date().greater("now").required().messages({
    "date.greater": "Expiration date must be in the future",
    "any.required": "Expiration date is required"
  }),
});

export const applyCouponVal = Joi.object({
  code: Joi.string().trim().required().messages({
    "string.empty": "Please enter a coupon code",
    "any.required": "Coupon code is required"
  }),
});
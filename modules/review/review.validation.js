import Joi from "joi";

export const createReviewVal = Joi.object({
  comment: Joi.string().trim().min(3).optional().messages({
    "string.min": "Comment must be at least 3 characters long",
  }),
  
  rating: Joi.number().min(1).max(5).required().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
    "any.required": "Rating is required",
  }),

  product: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid Product ID format",
    "any.required": "Product ID is required",
  }),
});
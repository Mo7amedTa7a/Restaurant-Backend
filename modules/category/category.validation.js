import Joi from "joi";

export const categorySchema = Joi.object({
  name: Joi.string().min(3).max(32).required().messages({
    "any.required": "Name is required",
    "string.min": "Category name must be at least 3 characters",
  }),
});

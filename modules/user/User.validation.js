import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(60).required().messages({
    "string.min": "Your Name Min 3 letter",
    "string.max": "Your name max 60 letter",
    "any.required": "Name is required",
  }),
  phone: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid Egyptian phone number",
      "any.required": "Phone number is required",
    }),

  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid Egyptian phone number",
      "any.required": "Phone number is required",
    }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
  newPassword: Joi.string().invalid(Joi.ref('currentPassword')).min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
    "any.invalid": "New password cannot be the same as the old password",
  }),
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(60).messages({
    "string.min": "Your Name Min 3 letter",
    "string.max": "Your name max 60 letter",
  }),
  phone: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .messages({
      "string.pattern.base": "Please enter a valid Egyptian phone number",
    }),
});

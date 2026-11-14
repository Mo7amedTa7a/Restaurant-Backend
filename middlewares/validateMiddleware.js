import AppError from "../utils/AppError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((err) => err.message).join(" ");
      return next(new AppError(errorMessage, 404));
    }
    next();
  };
};


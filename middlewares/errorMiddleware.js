const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  if (err.name === "CastError") {
    ((statusCode = 400), (message = "Invalid ID"));
  }
  if (err.code === 11000) {
    ((statusCode = 400), (message = "Duplicate value"));
  }
  if (err.name === "ValidationError") {
    ((statusCode = 400),
      (message = Object.values(err.errors)
        .map((e) => e.message)
        .join(",")));
  }
  if (err.name === "JsonWebTokenError") {
    ((statusCode = 400), (message = "Invalid token. Please log in again"));
  }
  if (err.name === "TokenExpiredError") {
    ((statusCode = 400),
      (message = "Your token has expired. Please log in again"));
  }

  return res.status(statusCode).json({
    statusCode,
    message,
  });
};

export default errorMiddleware;

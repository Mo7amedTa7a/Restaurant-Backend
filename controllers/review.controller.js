import { Order } from "../modules/order/order.model.js";
import { Review } from "../modules/review/review.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res, next) => {
  const { comment, rating, product } = req.body;
  const userId = req.user._id;

  const order = await Order.findOne({
    user: userId,
    status: "delivered",
    "cartItems.productId": product,
  });
  if (!order) {
    return next(
      new AppError(
        "You can only review products you have bought and received",
        403,
      ),
    );
  }
  const existingReview = await Review.findOne({ user: userId, product });
  if (existingReview) {
    return next(new AppError("You have already reviewed this product", 400));
  }
  const review = await Review.create({
    comment,
    rating,
    product,
    user: userId,
  });
  res.status(201).json({
    message: "Review added successfully",
    review,
  });
});

export const getReviews = asyncHandler(async (req, res, next) => {
  let filter = {};
  if (req.query.product) {
    filter = { product: req.query.product };
  }
  const reviews = await Review.find(filter)
    .populate("user", "name")
    .populate("product", "name");

  res.status(200).json({
    message: "Success",
    results: reviews.length,
    reviews,
  });
});

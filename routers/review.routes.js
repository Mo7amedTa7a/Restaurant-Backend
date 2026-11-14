import express from "express";
import { createReviewVal } from "../modules/review/review.validation.js";
import { createReview, getReviews } from "../controllers/review.controller.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("user"), 
  validate(createReviewVal),
  createReview
);

router.get("/", getReviews);

export default router;
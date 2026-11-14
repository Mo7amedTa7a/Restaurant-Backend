import express from "express";
import {
  applyCoupon,
  createCoupon,
  getCoupons,
} from "../controllers/coupon.controller.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { applyCouponVal, createCouponVal } from "../modules/coupon/coupon.validation.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate(createCouponVal),
  createCoupon,
);
router.get("/", protect, restrictTo("admin"), getCoupons);
router.put(
  "/apply-coupon",
  protect,
  restrictTo("user"),
  validate(applyCouponVal),
  applyCoupon,
);
export default router;

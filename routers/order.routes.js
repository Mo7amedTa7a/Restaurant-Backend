import express from "express";

import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createCashOrder,
  createCheckoutSession,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { createCashOrderSchema } from "../modules/order/order.validation.js";

const router = express.Router();

router.post(
  "/:id",
  protect,
  restrictTo("user"),
  validate(createCashOrderSchema),
  createCashOrder,
);
router.get("/", protect, restrictTo("admin"), getUserOrders);

router.put("/:id/status", protect, restrictTo("admin"), updateOrderStatus);
router.post(
  "/checkout-session/:id",
  protect,
  restrictTo("user"),
  validate(createCashOrderSchema),
  createCheckoutSession,
);
export default router;

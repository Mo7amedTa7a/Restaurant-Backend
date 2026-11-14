import express from "express";
import {
  addToCart,
  clearCart,
  getProductsInCart,
  removeProductInCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { addToCartSchema } from "../modules/cart/cart.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("user"),
  validate(addToCartSchema),
  addToCart,
);
router.get("/", protect, restrictTo("user"), getProductsInCart);
router.delete("/:id", protect, restrictTo("user"), removeProductInCart);
router.put("/", protect, restrictTo("user"), updateCartItemQuantity);
router.delete("/", protect, restrictTo("user"), clearCart);

export default router;

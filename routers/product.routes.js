import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deletedProduct,
  getDiscountedProducts,
} from "../controllers/product.controller.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";
import {
  productSchema,
  updateProductSchema,
} from "../modules/product/product.validation.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  uploadImage.single("image"),
  validate(productSchema),
  createProduct,
);
router.get("/", getProducts);
router.get("/discounted-products", getDiscountedProducts);
router.get("/:id", getProduct);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  uploadImage.single("image"),
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", protect, restrictTo("admin"), deletedProduct);
export default router;

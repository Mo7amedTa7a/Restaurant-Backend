import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategories,
} from "../controllers/category.controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { categorySchema } from "../modules/category/category.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate(categorySchema),
  createCategory,
);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  validate(categorySchema),
  updateCategories,
);
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

export default router;

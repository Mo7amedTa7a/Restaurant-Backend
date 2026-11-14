import { Category } from "../modules/category/category.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "slugify";

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new AppError("Category already exists", 400);
  }
  const category = await Category.create({
    name,
    slug: slugify(name),
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Category created successfully",
    category,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    status: { $ne: "deleted" },
  }).populate("createdBy", "name phone");

  res.status(200).json({
    message: "Categories fetched successfully",
    results: categories.length,
    categories,
  });
});

export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOne({
    _id: id,
    status: { $ne: "deleted" },
  });
  if (!category) {
    throw new AppError("Category Not Found", 404);
  }
  res.status(200).json({
    message: "Category fetched successfully",
    category,
  });
});

export const updateCategories = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  const category = await Category.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } },
    { name, slug: slugify(name) },
    { returnDocument: "after" },
  );
  if (!category) {
    throw new AppError("Category Not Found", 404);
  }
  res.status(201).json({
    message: "Category Update SuccussFull",
    category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } },
    { status: "deleted" },
    { returnDocument: "after" },
  );
  if (!category) {
    throw new AppError("Category Not Found", 404);
  }
  res.status(200).json({
    message: "Category Deleted",
    category,
  });
});

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
      minLength: [3, "Product name must be at least 3 characters"],
      maxLength: [100, "Product must be at most 100 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [10, "Product description must be at least 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    available: {
      type: Boolean,
      default: true,
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    preparationTime: {
      type: String,
      required: [true, "Preparation time is required"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "product must belong to a category"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model("Product", productSchema);

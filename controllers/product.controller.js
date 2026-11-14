import { Product } from "../modules/product/product.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";
import redisClient from "../config/redis.js";

export const createProduct = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Product image is required", 400);
  }
  const { name, description, price, discount, preparationTime, categoryId } =
    req.body;
  const existProduct = await Product.findOne({ name });
  if (existProduct) {
    throw new AppError("Product name already exists", 400);
  }
  const product = await Product.create({
    name,
    slug: slugify(name),
    description,
    price,
    discount: discount || 0,
    preparationTime,
    categoryId,
    createdBy: req.user._id,
    image: req.file.filename,
  });

  const keys = await redisClient.keys("products:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
  res.status(201).json({
    message: "Product created successfully",
    product,
  });
});

export const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = `products:${req.originalUrl}`;
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }

  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields", "keyword"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const finalFilter = JSON.parse(queryStr);
  finalFilter.status = { $ne: "deleted" };

  let mongooseQuery = Product.find(finalFilter)
    .populate("categoryId", "name slug")
    .populate("createdBy", "name phone");

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select("-__v");
  }

  if (req.query.keyword) {
    const query = {};
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 1;
  const skip = (page - 1) * limit;

  mongooseQuery = mongooseQuery.skip(skip).limit(limit);

  const products = await mongooseQuery;
  const responseData = {
    message: "All Products",
    result: products.length,
    page,
    products,
  };

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
  res.status(200).json(responseData);
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `products:${id}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }
  const product = await Product.findOne({
    _id: id,
    status: { $ne: "deleted" },
  })
    .populate("categoryId", "name slug")
    .populate("createdBy", "name phone");
  if (!product) {
    throw new AppError("Product Not Found", 404);
  }
  const responseData = {
    message: "Get product successFull",
    product,
  };
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
  res.status(200).json(responseData);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, discount, preparationTime, categoryId } =
    req.body;
  const product = await Product.findOne({
    _id: id,
    status: { $ne: "deleted" },
  });

  if (!product) {
    throw new AppError("Product Not Found", 404);
  }
  const updatedData = {
    name,
    description,
    price,
    discount,
    preparationTime,
    categoryId,
  };
  if (name) {
    updatedData.slug = slugify(name);
  }
  if (req.file) {
    updatedData.image = req.file.filename;
    const oldImagePath = path.join("uploads", product.image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } },
    updatedData,
    { returnDocument: "after" },
  );

  const keys = await redisClient.keys("products:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
  res.status(201).json({
    message: "Product Update SuccessFull",
    updatedProduct,
  });
});

export const deletedProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } },
    { status: "deleted" },
    { returnDocument: "after" },
  );
  if (!product) {
    throw new AppError("Product Not Found", 404);
  }
  const keys = await redisClient.keys("products:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
  res.status(201).json({
    message: "Product Update successFull",
    product,
  });
});

export const getDiscountedProducts = asyncHandler(async (req, res) => {
  const cachekey = "products:discounted";

  const cachedData = await redisClient.get(cachekey);
  if (cachedData) {
    return res.status(200).json(JSON.parse(cachedData));
  }
  const products = await Product.find({
    status: { $ne: "deleted" },
    discount: { $gt: 0 },
  })
    .populate("categoryId", "name slug")
    .populate("createdBy", "name phone");

  const responseData = {
    message: "Discounted Products retrieved successfully",
    result: products.length,
    products,
  };
  await redisClient.setEx(cachekey, 3600, JSON.stringify(responseData));
  res.status(200).json(responseData);
});

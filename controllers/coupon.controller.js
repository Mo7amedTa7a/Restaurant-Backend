import { Cart } from "../modules/cart/cart.model.js";
import { Coupon } from "../modules/coupon/coupon.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discount, expires } = req.body;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return res.status(400).json({ message: "Coupon already exists" });
  }

  const coupon = await Coupon.create({
    code,
    discount,
    expires,
  });

  res.status(201).json({ message: "Coupon created successfully", coupon });
});

export const getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({ message: "Success", coupons });
});


export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    expires: { $gt: Date.now() } 
  });

  if (!coupon) {
    return res.status(400).json({ message: "Invalid or expired coupon" });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const discountAmount = (cart.totalPrice * coupon.discount) / 100;
  cart.totalPriceAfterDiscount = (cart.totalPrice - discountAmount).toFixed(2);
  
  await cart.save();

  res.status(200).json({ 
    message: "Coupon applied successfully", 
    cart 
  });
});
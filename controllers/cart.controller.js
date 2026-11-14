import { Cart } from "../modules/cart/cart.model.js";
import { Product } from "../modules/product/product.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findOne({
    _id: productId,
    status: { $ne: "deleted" },
  });
  if (!product) {
    throw new AppError("Product Not Found", 404);
  }
  const finalPrice =
    product.discount > 0
      ? product.price - (product.price * product.discount) / 100
      : product.price;
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({
      userId: req.user._id,
      cartItems: [
        {
          productId: productId,
          quantity: quantity || 1,
          price: finalPrice,
        },
      ],
    });
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (productIndex > -1) {
      cart.cartItems[productIndex].quantity += quantity || 1;
      cart.cartItems[productIndex].price = finalPrice;
    } else {
      cart.cartItems.push({
        productId: productId,
        quantity: quantity || 1,
        price: finalPrice,
      });
    }
  }
  let calcTotalPrice = 0;
  cart.cartItems.forEach((item) => {
    calcTotalPrice += item.price * item.quantity;
  });
  cart.totalPrice = calcTotalPrice;
  await cart.save();
  res.status(200).json({
    message: "Add Product To Cart SuccessFull",
    cart,
  });
});

export const getProductsInCart = asyncHandler(async (req, res) => {
  const productInCart = await Cart.findOne({ userId: req.user._id }).populate(
    "cartItems.productId",
    "name price image",
  );
  if (!productInCart) {
    throw new AppError("Cart Is Empty...", 400);
  }
  res.status(200).json({
    message: "All Product In Cart",
    result: productInCart.length,
    productInCart,
  });
});

export const removeProductInCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { cartItems: { productId: id } } },
    { returnDocument: "after" },
  );
  if (!cart) {
    throw new AppError("Product Not Found", 404);
  }

  let calcTotalPrice = 0;
  cart.cartItems.forEach((item) => {
    calcTotalPrice += item.price * item.quantity;
  });
  cart.totalPrice = calcTotalPrice;
  await cart.save();

  res.status(200).json({
    message: "Product removed from cart successfully",
    cart,
  });
});

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new AppError("Product Not Found", 404);
  }
  const itemIndex = cart.cartItems.findIndex((item) => {
    item.productId === id;
  });

  if (itemIndex > -1) {
    if (quantity < 1) {
      cart.cartItems.splice(itemIndex, 1);
    } else {
      cart.cartItems[itemIndex].quantity = quantity;
    }
  } else {
    throw new AppError("Product not found in your cart", 404);
  }

  let calcTotalPrice = 0;
  cart.cartItems.forEach((item) => {
    calcTotalPrice += item.price * item.quantity;
  });
  cart.totalPrice = calcTotalPrice;
  await cart.save();
  res.status(200).json({
    message: "Cart updated successfully",
    cart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { cartItems: [], totalPrice: 0 },
    { returnDocument: "after" },
  );
  if (!cart) {
    throw new AppError("Cart Not Found", 404);
  }

  res.status(200).json({
    message: "Cart cleared successfully",
    cart,
  });
});

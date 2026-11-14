import { Cart } from "../modules/cart/cart.model.js";
import { Order } from "../modules/order/order.model.js";
import User from "../modules/user/User.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import Stripe from "stripe";

export const createCashOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.cartItems.length === 0) {
    throw new AppError("Your cart is empty or not found", 404);
  }
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentOrder = await Order.findOne({
    user: req.user._id,
    createdAt: { $gt: oneMinuteAgo },
  });

  if (recentOrder) {
    throw new AppError(
      "You already placed an order just now. Please wait a moment.",
      429,
    );
  }

  const orderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    paymentMethodType: "cash",
  });

  if (order) {
    await Cart.findByIdAndUpdate(cart._id, {
      cartItems: [],
      totalPrice: 0,
      totalPriceAfterDiscount: 0,
    });
  }

  res.status(201).json({
    message: "Cash order created successfully",
    order,
  });
});

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.cartItems.length === 0) {
    throw new AppError("Your cart is empty or not found", 404);
  }
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentOrder = await Order.findOne({
    user: req.user._id,
    createdAt: { $gt: oneMinuteAgo },
  });

  if (recentOrder) {
    throw new AppError(
      "You already placed an order just now. Please wait a moment.",
      429,
    );
  }

  const orderPrice =
    cart.totalPriceAfterDiscount > 0
      ? cart.totalPriceAfterDiscount
      : cart.totalPrice;

  const stripe = new Stripe(process.env.STRIPE_SECRET);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Order from User: ${req.user.name}`,
          },
          unit_amount: Math.round(orderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",

    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",

    customer_phone: req.user.phone,
    client_reference_id: cart._id.toString(),
    metadata: {
      shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : "{}",
      userId: req.user._id.toString(),
    },
  });
  res.status(200).json({
    message: "Checkout session created successfully",
    session,
  });
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "cartItems.productId",
    "name image price",
  );

  if (!orders) {
    throw new AppError("No orders found for this user", 404);
  }

  res.status(200).json({
    message: "User orders fetched successfully",
    results: orders.length,
    orders,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    throw new AppError(
      `You cannot change the status of a ${order.status} order`,
      400,
    );
  }
  order.status = status;

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.isPaid = true;
    order.paidAt = Date.now();
  }
  if (status === "cancelled") {
  }
  await order.save();

  res.status(200).json({
    message: "Order status updated successfully",
    order,
  });
});

export const webhookCheckout = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET);

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const cartId = session.client_reference_id;
    // const customerPhone = session.customer_phone;
    const shippingAddress = JSON.parse(session.metadata.shippingAddress);
    const userId = session.metadata.userId;
    const orderPrice = session.amount_total / 100;

    const cart = await Cart.findById(cartId);
    const user = await User.findOne(userId);

    if (!cart || !user) {
      return res.status(404).send("Cart or User not found");
    }

    const order = await Order.create({
      user: user._id,
      cartItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice: orderPrice,
      paymentMethodType: "card",
      isPaid: true,
      paidAt: Date.now(),
      status: "pending",
    });

    if (order) {
      await Cart.findByIdAndUpdate(cart._id, {
        cartItems: [],
        totalPrice: 0,
        totalPriceAfterDiscount: 0,
      });
    }
  }
  res.status(200).json({ received: true });
});

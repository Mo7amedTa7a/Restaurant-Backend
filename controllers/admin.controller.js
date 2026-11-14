import { Order } from "../modules/order/order.model.js";
import { Product } from "../modules/product/product.model.js";
import User from "../modules/user/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({
    role: "user",
    status: { $ne: "DELETED" },
  });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const revenueStats = await Order.aggregate([
    {
      $match: { status: "delivered" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalOrderPrice" },
      },
    },
  ]);
  const totalRevenue =
    revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    message: "Admin Dashboard Statistics",
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    },
  });
});

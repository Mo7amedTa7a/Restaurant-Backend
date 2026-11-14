import cron from "node-cron";
import User from "../modules/user/User.model.js";
import { Product } from "../modules/product/product.model.js";

const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const otpCleanup = await User.updateMany(
        { passwordResetExpires: { $lt: Date.now() } },
        {
          $unset: {
            passwordResetCode: 1,
            passwordResetExpires: 1,
            passwordResetVerified: 1,
          },
        }
      );
      console.log(
        `Cleared expired OTPs for ${otpCleanup.modifiedCount} users.`
      );

      const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const productCleanup = await Product.deleteMany({
        status: "deleted",
        updatedAt: { $lt: thirtyDayAgo },
      });
      console.log(
        `Permanently deleted ${productCleanup.deletedCount} old soft-deleted products.`
      );
    } catch (error) {
      console.error(" Error running cron jobs:", error);
    }
  });
};

export default startCronJobs;
import User from "../modules/user/User.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });
  if (!user) {
    throw new AppError("There is no user with this phone number", 404);
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save({ validateBeforeSave: false });
  console.log(`Your OTP Code is: ${resetCode}`);
  res.status(200).json({
    success: true,
    message: "OTP code sent successfully to your phone",
  });
});

export const verifyResetCode = asyncHandler(async (req, res) => {
  const { phone, resetCode } = req.body;
  const hashRestCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  const user = await User.findOne({
    phone,
    passwordResetCode: hashRestCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError("Invalid or expired OTP code", 400);
  }
  user.passwordResetVerified = true;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "OTP verified successfully, you can now reset your password",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { phone, newPassword } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
    throw new AppError("There is no user with this phone number", 404);
  }
  if (!user.passwordResetVerified) {
    throw new AppError("You must verify the OTP code first", 400);
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

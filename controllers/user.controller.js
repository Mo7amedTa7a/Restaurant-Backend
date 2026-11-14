import User from "../modules/user/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import generateToken from "../utils/jwt.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  const isUserExist = await User.findOne({ phone });
  if (isUserExist) {
    throw new AppError("Phone number already registered", 409);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    password: hashedPassword,
  });
  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    user,
    token,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone, status: { $ne: "DELETED" } }).select(
    "+password",
  );
  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid phone or password", 401);
  }
  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    message: "Login Successful",
    token,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const id = req.user._id;

  const user = await User.findOne({
    _id: id,
    status: { $ne: "DELETED" },
  }).select("+password");

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("password not match , invalid password", 401);
  }
  const hashPassword = await bcrypt.hash(newPassword, 10);

  await User.findOneAndUpdate({ _id: id }, { password: hashPassword });

  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    message: "Password updated Successful",
    token,
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ status: { $ne: "DELETED" } });
  res.status(200).json({
    success: true,
    users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id, status: { $ne: "DELETED" } });

  if (!user) {
    throw new AppError("User Not Found", 404);
  }
  res.status(200).json({
    success: true,
    user,
  });
});

const getUserUpdate = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const { name, phone } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: id, status: { $ne: "DELETED" } },
    {
      name,
      phone,
    },
    {
      returnDocument: "after",
    },
  );
  if (!user) {
    throw new AppError("User Not Found", 404);
  }
  res.status(200).json({
    success: true,
    user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const user = await User.findOneAndUpdate(
    { _id: id, status: { $ne: "DELETED" } },
    { status: "DELETED" },
    { returnDocument: "after" },
  );

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

export {
  registerUser,
  loginUser,
  changePassword,
  getMyProfile,
  getUsers,
  getUserById,
  getUserUpdate,
  deleteUser,
};

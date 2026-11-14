import express from "express";

import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import {
  registerUser,
  deleteUser,
  getUserById,
  getUsers,
  getUserUpdate,
  loginUser,
  getMyProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  userUpdateSchema,
} from "../modules/user/User.validation.js";
import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

router.get("/me", protect, getMyProfile);
router.patch(
  "/update-password",
  protect,
  validate(changePasswordSchema),
  changePassword,
);

router.patch("/update-me", protect, validate(userUpdateSchema), getUserUpdate);
router.delete("/delete-me", protect, deleteUser);

router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/:id", protect, restrictTo("admin"), getUserById);

router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyResetCode);
router.put("/reset-password", resetPassword);

export default router;

import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/stats", protect, restrictTo("admin"),getAdminStats);

export default router;
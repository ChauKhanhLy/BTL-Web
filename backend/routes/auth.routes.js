import express from "express"
import { login, forgotPassword, createUserByAdmin} from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = express.Router()

router.post("/login", login)
router.post("/forgot-password", forgotPassword)
// 🔐 ADMIN tạo user
router.post(
  "/admin/create-user",
  verifyToken,
  requireAdmin,
  createUserByAdmin
);

export default router

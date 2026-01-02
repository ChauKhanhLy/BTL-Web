import express from "express"
import { login, forgotPassword, createUserByAdmin, changePassword, resetPassword } from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = express.Router()

router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post(
  "/change-password",
  verifyToken,   // 🔐 BẮT BUỘC
  changePassword
);
console.log("REGISTER RESET PASSWORD ROUTE");
router.post("/reset-password", resetPassword);
router.post(
  "/admin/create-user",
  verifyToken,
  requireAdmin,
  createUserByAdmin
);
export default router

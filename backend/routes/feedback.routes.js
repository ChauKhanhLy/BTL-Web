import express from "express";
import {
  submitFeedback,
  getMyFeedbacks,
  getFeedbackByOrder,
  updateFeedbackStatus,
} from "../controllers/feedback.controller.js";

const router = express.Router();

/**
 * USER
 */

// Gửi phản ánh mới
// POST /api/feedback
router.post("/", submitFeedback);

// Lấy lịch sử feedback của user
// GET /api/feedback/me?user_id=1
router.get("/me", getMyFeedbacks);


/**
 * ADMIN
 */

// Lấy feedback theo order
// GET /api/feedback/order/123
router.get("/order/:orderId", getFeedbackByOrder);

// Cập nhật trạng thái feedback
// PATCH /api/feedback/5/status
router.patch("/:id/status", updateFeedbackStatus);

export default router;

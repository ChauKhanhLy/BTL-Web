import express from "express";
import {
  submitFeedback,
  getMyFeedbacks,
  getFeedbackByOrder,
  updateFeedbackStatus,
  getAllFeedbacks,
  getFeedbackById,
  replyFeedback,
  resolveFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

/* ========== USER ========== */
router.post("/", submitFeedback);
router.get("/me", getMyFeedbacks);
router.get("/order/:orderId", getFeedbackByOrder);
router.patch("/:id/status", updateFeedbackStatus);

/* ========== ADMIN ========== */
router.get("/", getAllFeedbacks);
router.get("/:id", getFeedbackById);
router.post("/:id/reply", replyFeedback);
router.put("/:id/resolve", resolveFeedback);

export default router;
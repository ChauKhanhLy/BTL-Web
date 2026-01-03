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
  deleteFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

/* ========== USER ========== */
router.post("/", submitFeedback);
router.get("/me", getMyFeedbacks);
router.get("/order/:orderId", getFeedbackByOrder);
router.patch("/:id/status", updateFeedbackStatus); // Thêm dòng này
router.delete("/:id", deleteFeedback);
/* ========== ADMIN ========== */
router.get("/:id", getFeedbackById);
router.get("/", getAllFeedbacks);

router.post("/:id/reply", replyFeedback);
router.put("/:id/resolve", resolveFeedback);

export default router;

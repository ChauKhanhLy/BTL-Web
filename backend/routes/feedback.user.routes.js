import express from "express";
import {
  submitFeedback,
  getMyFeedbacks,
  getFeedbackByOrder,
  updateFeedbackStatus,
} from "../controllers/feedback.user.controller.js";

const router = express.Router();

router.post("/", submitFeedback);
router.get("/me", getMyFeedbacks);
router.get("/order/:orderId", getFeedbackByOrder);
router.patch("/:id/status", updateFeedbackStatus);

export default router;
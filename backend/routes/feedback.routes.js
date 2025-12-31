import express from "express";
import * as feedbackController from "../controllers/feedback.controller.js";
import {
  submitFeedback,
  getMyFeedbacks,
  getFeedbackByOrder,
  updateFeedbackStatus,
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/", submitFeedback);
router.get("/me", getMyFeedbacks);
router.get("/order/:orderId", getFeedbackByOrder);
router.patch("/:id/status", updateFeedbackStatus);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/:id', feedbackController.getFeedbackById);
router.post('/:id/reply', feedbackController.replyFeedback);
router.put('/:id/resolve', feedbackController.resolveFeedback);

export default router;
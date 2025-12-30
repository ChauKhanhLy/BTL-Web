import express from "express";
const feedbackController = require('../controllers/feedback.controller.js');
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

router.get("/order/:orderId", getFeedbackByOrder);


router.patch("/:id/status", updateFeedbackStatus);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/:id', feedbackController.getFeedbackById);
router.post('/:id/reply', feedbackController.replyFeedback);
router.put('/:id/resolve', feedbackController.resolveFeedback);

module.exports = router;
export default router;

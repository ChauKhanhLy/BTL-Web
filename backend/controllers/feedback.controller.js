import * as feedbackService from "../services/feedback.service.js";

/**
 * POST /api/feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const result = await feedbackService.createFeedback(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/feedback/me?user_id=1
 */
export const getMyFeedbacks = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbacksByUser(req.query.user_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/feedback/order/:orderId
 */
export const getFeedbackByOrder = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbacksByOrder(req.params.orderId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/feedback/:id/status
 */
export const updateFeedbackStatus = async (req, res) => {
  try {
    const data = await feedbackService.updateFeedbackStatus(
      req.params.id,
      req.body.status
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
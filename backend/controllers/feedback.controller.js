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
 * GET /api/feedback/me?user_id=xxx&status=optional
 */
export const getMyFeedbacks = async (req, res) => {
  try {
    const { user_id, status } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const data = status
      ? await feedbackService.getFeedbacksByUserWithFilter(user_id, { status })
      : await feedbackService.getFeedbacksByUser(user_id);

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/feedback/:id
 */
export const deleteFeedback = async (req, res) => {
  try {
    await feedbackService.deleteFeedback(req.params.id);
    res.json({ success: true });
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
    res.status(400).json({ error: err.message });
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

/* ================= ADMIN ================= */

/**
 * GET /api/feedback
 */
export const getAllFeedbacks = async (req, res) => {
  try {
    const { search, user } = req.query; // để sẵn
    const data = await feedbackService.getFeedbackList({ search, user });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/feedback/:id
 */
export const getFeedbackById = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbackDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * POST /api/feedback/:id/reply
 */
export const replyFeedback = async (req, res) => {
  try {
    const data = await feedbackService.replyToFeedback(
      req.params.id,
      req.body.replyText
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Put /api/feedback/:id/resolve
 */
export const resolveFeedback = async (req, res) => {
  try {
    const data = await feedbackService.markAsResolved(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

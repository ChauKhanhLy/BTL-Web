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

export const getAllFeedbacks = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbackList(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const data = await feedbackService.getFeedbackDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const replyFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const data = await feedbackService.replyToFeedback(id, replyText);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resolveFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await feedbackService.markAsResolved(id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


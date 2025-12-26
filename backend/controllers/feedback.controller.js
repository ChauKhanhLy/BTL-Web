import * as feedbackDAL from "../dal/feedback.dal.js";

/**
 * USER: Gửi phản ánh mới
 * POST /api/feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const {
      user_id,
      order_id,
      food_id,
      rating,
      comment,
      impact,
      tags,
    } = req.body;

    if (!user_id || !order_id || !food_id) {
      return res.status(400).json({
        error: "Missing user_id / order_id / food_id",
      });
    }

    const feedback = await feedbackDAL.createFeedback({
      user_id,
      order_id,
      food_id,
      rating,
      comment,
      impact,
      tags,
      status: "Đang xử lý",
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * USER: Lấy lịch sử feedback của tôi
 * GET /api/feedback/me?user_id=1
 */
export const getMyFeedbacks = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const data = await feedbackDAL.getFeedbackByUser(user_id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: Lấy feedback theo order
 * GET /api/feedback/order/:orderId
 */
export const getFeedbackByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = await feedbackDAL.getFeedbackByOrder(orderId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: Cập nhật trạng thái feedback
 * PATCH /api/feedback/:id/status
 */
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Missing status" });
    }

    const updated = await feedbackDAL.updateFeedbackStatus(id, status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

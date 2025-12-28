import * as feedbackDAL from "../dal/feedback.dal.js";

export async function createFeedback(data) {
  const {
    user_id,
    order_id,
    food_id,
    rating,
    comment,
    impact,
    tags,
  } = data;

  if (!user_id || !order_id || !food_id) {
    throw new Error("Missing user_id / order_id / food_id");
  }

  return await feedbackDAL.createFeedback({
    user_id,
    order_id,
    food_id,
    rating,
    comment,
    impact,
    tags,
    status: "Đang xử lý",
  });
}

export async function getFeedbacksByUser(user_id) {
  if (!user_id) throw new Error("Missing user_id");

  return await feedbackDAL.getFeedbackByUser(user_id);
}

export async function getFeedbacksByOrder(orderId) {
  return await feedbackDAL.getFeedbackByOrder(orderId);
}

export async function updateFeedbackStatus(id, status) {
  if (!status) throw new Error("Missing status");

  return await feedbackDAL.updateFeedbackStatus(id, status);
}

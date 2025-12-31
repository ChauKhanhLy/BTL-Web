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

export const getFeedbackList = async (query) => {
  const rawData = await feedbackDal.getAllFeedbacks(query);

  return rawData.map(item => ({
    ...item,
    customerName: item.users ? item.users.name : 'Guest',
    orderNumber: item.orders ? `#${item.orders.id}` : 'N/A'
  }));
};

export const getFeedbackDetail = async (id) => {
  return await feedbackDal.getFeedbackById(id);
};

export const replyToFeedback = async (id, replyText) => {
  return await feedbackDal.updateFeedback(id, {
    reply_text: replyText,
    status: 'Đã phản hồi'
  });
};

export const markAsResolved = async (id) => {
  return await feedbackDal.updateFeedback(id, { status: 'Đã đóng' });
};

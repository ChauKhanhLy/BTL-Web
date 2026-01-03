import * as feedbackDAL from "../dal/feedback.dal.js";

/* ================= BASIC FUNCTIONS ================= */

// feedback.service.js - Sửa hàm createFeedback
// feedback.service.js - Thêm validation chi tiết
export async function createFeedback(data) {
  const user_id = data.user_id;
  const order_id = Number(data.order_id);
  const food_id = Number(data.food_id);

  const rating = Number.isInteger(Number(data.rating))
    ? Number(data.rating)
    : null;

  const comment = data.comment?.trim() || null;
  const tags = data.tags || null;
  const impact = data.impact || "Vừa";

  // ✅ MAP ENUM ĐÚNG DB
  const statusMap = {
    submitted: "Đang xử lý",
    processing: "Đang xử lý",
    replied: "Đã phản hồi",
    resolved: "Đã đóng",
  };

  const typeMap = {
    issue: "Issue",
    feature: "Feature",
    praise: "Praise",
  };

  const status = statusMap[data.status] || "Đang xử lý";
  const type = typeMap[data.type] || "Issue";

  const title =
    data.title || `Phản ánh - ${new Date().toLocaleDateString("vi-VN")}`;

  const date = data.date || new Date().toISOString();

  // ✅ VALIDATION ĐÚNG DB
  if (!user_id) throw new Error("Missing user_id");
  if (!order_id || order_id <= 0) throw new Error("Invalid order_id");
  if (!food_id || food_id <= 0) throw new Error("Invalid food_id");

  const validImpacts = ["Nhẹ", "Vừa", "Nghiêm trọng"];
  if (!validImpacts.includes(impact)) {
    throw new Error("Invalid impact value");
  }

  const feedbackData = {
    user_id,
    order_id,
    food_id,
    rating,
    comment,
    impact,
    tags,
    title,
    type,
    status,
    date,
  };

  return await feedbackDAL.createFeedback(feedbackData);
}

// Thêm hàm getFeedbacksByUserWithFilter
export async function getFeedbacksByUserWithFilter(user_id, filters = {}) {
  if (!user_id) throw new Error("Missing user_id");

  const data = await feedbackDAL.getFeedbackByUser(user_id);

  // Map status FE -> DB
  const statusMap = {
    draft: "Đang xử lý",
    submitted: "Đang xử lý",
    processing: "Đang xử lý",
    replied: "Đã phản hồi",
    resolved: "Đã đóng",
  };

  if (filters.status) {
    const mappedStatus = statusMap[filters.status] || filters.status;
    return data.filter(fb => fb.status === mappedStatus);
  }

  return data;
}


// feedback.service.js - Thêm hàm
export async function deleteFeedback(id) {
  if (!id) throw new Error("Missing feedback ID");
  return await feedbackDAL.deleteFeedback(id);
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

/* ================= ADMIN FUNCTIONS ================= */
export const getFeedbackList = async (query = {}) => {
  const rawData = await feedbackDAL.getAllFeedbacks(query);

  return rawData.map(item => ({
    ...item,
    customerName: item.users?.name || "Guest",
    customerEmail: item.users?.email || "N/A",
    orderNumber: item.orders ? `#${item.orders.id}` : "N/A",
  }));
};


export const getFeedbackDetail = async (id) => {
  return await feedbackDAL.getFeedbackById(id);
};

export const replyToFeedback = async (id, replyText) => {
  return await feedbackDAL.updateFeedback(id, {
    reply_text: replyText,
    status: "Đã phản hồi",
  });
};

export const markAsResolved = async (id) => {
  return await feedbackDAL.updateFeedback(id, {
    status: "Đã đóng",
  });
};

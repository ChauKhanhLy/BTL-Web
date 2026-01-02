import * as feedbackDAL from "../dal/feedback.dal.js";

/* ================= BASIC FUNCTIONS ================= */

// feedback.service.js - Sửa hàm createFeedback
// feedback.service.js - Thêm validation chi tiết
export async function createFeedback(data) {
  console.log("🔧 [SERVICE] createFeedback called with:", JSON.stringify(data, null, 2));
  
  // Parse và validate từng field
  const user_id = data.user_id;
  const order_id = parseInt(data.order_id);
  const food_id = parseInt(data.food_id);
  const rating = parseInt(data.rating) || 0;
  const comment = data.comment || "";
  const impact = data.impact || "Vừa";
  const tags = data.tags || "";
  const title = data.title || "";
  const type = data.type || "Chất lượng món";
  const status = data.status || "submitted";
  const date = data.date || new Date().toISOString();

  console.log("🔧 [SERVICE] Parsed values:", {
    user_id, order_id, food_id, rating, comment, impact, status
  });

  // Validation chi tiết
  const errors = [];
  
  if (!user_id || typeof user_id !== 'string') {
    errors.push("user_id phải là string UUID");
  }
  
  if (!order_id || isNaN(order_id) || order_id <= 0) {
    errors.push("order_id phải là số nguyên dương");
  }
  
  if (!food_id || isNaN(food_id) || food_id <= 0) {
    errors.push("food_id phải là số nguyên dương");
  }
  
  if (isNaN(rating) || rating < 0 || rating > 5) {
    errors.push("rating phải là số từ 0-5");
  }
  
  if (!comment.trim()) {
    errors.push("comment không được để trống");
  }
  
  const validImpacts = ["Nhẹ", "Vừa", "Nghiêm trọng"];
  if (!validImpacts.includes(impact)) {
    errors.push(`impact phải là một trong: ${validImpacts.join(", ")}`);
  }
  
  const validStatuses = ["draft", "submitted", "resolved"];
  if (!validStatuses.includes(status)) {
    errors.push(`status phải là một trong: ${validStatuses.join(", ")}`);
  }
  
  if (errors.length > 0) {
    const errorMsg = `Validation errors: ${errors.join("; ")}`;
    console.error("[SERVICE] Validation failed:", errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const feedbackData = {
      user_id,
      order_id,
      food_id,
      rating,
      comment,
      impact,
      tags,
      title: title || `Phản ánh - ${new Date().toLocaleDateString('vi-VN')}`,
      type,
      status,
      date,
      created_at: new Date().toISOString()
    };

    console.log("[SERVICE] Calling DAL with data:", feedbackData);
    
    const result = await feedbackDAL.createFeedback(feedbackData);
    console.log("[SERVICE] Feedback created successfully");
    return result;
    
  } catch (error) {
    console.error("[SERVICE] Error:", error.message);
    throw error;
  }
}
// Thêm hàm getFeedbacksByUserWithFilter
export async function getFeedbacksByUserWithFilter(user_id, filters = {}) {
  if (!user_id) throw new Error("Missing user_id");
  
  const data = await feedbackDAL.getFeedbackByUser(user_id);
  
  // Filter by status if provided
  if (filters.status) {
    return data.filter(fb => fb.status === filters.status);
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

export const getFeedbackList = async (query) => {
  const rawData = await feedbackDAL.getAllFeedbacks(query);

  return rawData.map(item => ({
    ...item,
    customerName: item.users ? item.users.name : "Guest",
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

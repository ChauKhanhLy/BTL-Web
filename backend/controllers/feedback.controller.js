import * as feedbackService from "../services/feedback.service.js";

/**
 * POST /api/feedback
 */
// feedback.controller.js - Thêm logging
// feedback.controller.js - Thêm logging toàn bộ request
export const submitFeedback = async (req, res) => {
  console.log("=".repeat(60));
  console.log("[CONTROLLER] submitFeedback REQUEST RECEIVED");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Body type check:", {
    user_id: typeof req.body.user_id,
    order_id: typeof req.body.order_id,
    food_id: typeof req.body.food_id,
    rating: typeof req.body.rating
  });
  
  try {
    console.log("Calling service layer...");
    const result = await feedbackService.createFeedback(req.body);
    console.log("[CONTROLLER] Success - Response:", JSON.stringify(result, null, 2));
    console.log("=".repeat(60));
    res.status(201).json(result);
  } catch (err) {
    console.error("[CONTROLLER] Error details:");
    console.error("- Message:", err.message);
    console.error("- Stack:", err.stack);
    console.error("- Full error:", err);
    console.log("=".repeat(60));
    res.status(400).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/**
 * GET /api/feedback/me?user_id=1
 */
// feedback.controller.js - Sửa hàm getMyFeedbacks
export const getMyFeedbacks = async (req, res) => {
  try {
    const { user_id, status } = req.query;
    
    let data;
    if (status) {
      // Use new filtered function
      data = await feedbackService.getFeedbacksByUserWithFilter(user_id, { status });
    } else {
      data = await feedbackService.getFeedbacksByUser(user_id);
    }
    
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Thêm hàm deleteFeedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await feedbackService.deleteFeedback(id);
    res.json(result);
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

// feedback.service.js - Sửa hàm createFeedback
export async function createFeedback(data) {
  console.log("=".repeat(50));
  console.log("🔧 createFeedback service called");
  console.log("Input data:", JSON.stringify(data, null, 2));
  
  const {
    user_id,
    order_id,
    food_id,
    rating = 0,
    comment,
    impact = "Vừa",
    tags = "",
    title = "",
    type = "Chất lượng món",
    status = "submitted",
    date = new Date().toISOString()
  } = data;

  console.log("Parsed fields:");
  console.log("- user_id:", user_id, "type:", typeof user_id);
  console.log("- order_id:", order_id, "type:", typeof order_id);
  console.log("- food_id:", food_id, "type:", typeof food_id);
  console.log("- rating:", rating, "type:", typeof rating);
  console.log("- comment:", comment);
  console.log("- impact:", impact);
  console.log("- status:", status);

  // Validate required fields
  const missingFields = [];
  if (!user_id) missingFields.push("user_id");
  if (!order_id) missingFields.push("order_id");
  if (!food_id) missingFields.push("food_id");
  
  if (missingFields.length > 0) {
    throw new Error(`Thiếu trường bắt buộc: ${missingFields.join(", ")}`);
  }

  // Validate rating
  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    throw new Error("Rating phải là số từ 0-5");
  }

  // Validate impact
  const validImpacts = ["Nhẹ", "Vừa", "Nghiêm trọng"];
  if (!validImpacts.includes(impact)) {
    throw new Error(`Mức độ ảnh hưởng không hợp lệ. Phải là một trong: ${validImpacts.join(", ")}`);
  }

  // Validate status
  const validStatuses = ["draft", "submitted", "resolved"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Trạng thái không hợp lệ. Phải là một trong: ${validStatuses.join(", ")}`);
  }

  try {
    const feedbackData = {
      user_id: user_id,
      order_id: Number(order_id), // Đảm bảo là number
      food_id: Number(food_id), // Đảm bảo là number
      rating: Number(rating) || 0,
      comment: comment || "",
      impact: impact,
      tags: typeof tags === 'string' ? tags : (Array.isArray(tags) ? tags.join(", ") : ""),
      title: title || `Phản ánh - ${new Date().toLocaleDateString('vi-VN')}`,
      type: type || "Chất lượng món",
      status: status,
      date: date,
      created_at: new Date().toISOString()
    };

    console.log("📦 Data to save:", feedbackData);
    
    const result = await feedbackDAL.createFeedback(feedbackData);
    console.log("✅ Feedback saved successfully:", result);
    console.log("=".repeat(50));
    return result;
    
  } catch (error) {
    console.error("❌ Error in createFeedback service:", error);
    console.log("=".repeat(50));
    throw new Error(`Không thể tạo phản ánh: ${error.message}`);
  }
}

/* ================= ADMIN ================= */

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
};


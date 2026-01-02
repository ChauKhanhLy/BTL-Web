import { supabase } from "../database/supabase.js";

/**
 * Tạo phản ánh mới
 */
/*feedback.dal.js - Sửa hàm createFeedback
export const createFeedback = async (feedback) => {
  console.log("DAL: Inserting feedback:", feedback);
  
  const { data, error } = await supabase
    .from("feedback")
    .insert([{
      user_id: feedback.user_id,
      order_id: feedback.order_id,
      food_id: feedback.food_id,
      rating: feedback.rating,
      comment: feedback.comment,
      impact: feedback.impact,
      tags: feedback.tags,
      status: feedback.status,
      title: feedback.title,
      type: feedback.type,
      date: feedback.date,
      created_at: feedback.created_at
    }])
    .select(`
      id,
      created_at,
      rating,
      comment,
      impact,
      status,
      tags,
      title,
      type,
      order_id,
      food:food_id (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error("DAL: Insert error:", error);
    throw error;
  }
  
  console.log("DAL: Insert successful:", data);
  return data;
};*/
// feedback.dal.js - Sửa hàm createFeedback
// feedback.dal.js - Sửa hàm createFeedback cho đúng với schema
export const createFeedback = async (feedback) => {
  console.log("🗄️ [DAL] Inserting feedback with data:", JSON.stringify(feedback, null, 2));
  
  try {
    // Chuẩn bị data đúng với schema database
    const insertData = {
      user_id: feedback.user_id,
      order_id: feedback.order_id, // Đã là number từ service
      food_id: feedback.food_id,   // Đã là number từ service
      rating: feedback.rating || 0,
      comment: feedback.comment || "",
      impact: feedback.impact || "Vừa",
      tags: feedback.tags || "",
      status: feedback.status || "submitted",
      title: feedback.title || "",
      type: feedback.type || "Chất lượng món",
      date: feedback.date || new Date().toISOString(),
      created_at: feedback.created_at || new Date().toISOString()
    };

    console.log("🗄️ [DAL] Prepared insert data:", insertData);
    
    // QUAN TRỌNG: Không dùng .single() nếu muốn lấy data trả về
    const { data, error } = await supabase
      .from("feedback")
      .insert([insertData])
      .select(`
        id,
        created_at,
        rating,
        comment,
        impact,
        status,
        tags,
        title,
        type,
        order_id,
        food_id,
        food:food_id (
          id,
          name
        )
      `);

    if (error) {
      console.error("🗄️ [DAL] Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log("🗄️ [DAL] Insert successful, returned data:", data);
    
    // Trả về record đầu tiên
    return data ? data[0] : null;
    
  } catch (err) {
    console.error("🗄️ [DAL] Catch error:", err);
    throw new Error(`Database error: ${err.message}`);
  }
};
/**
 * Lấy feedback theo user (cho trang FeedbackPage - lịch sử)
 */
export const getFeedbackByUser = async (userId) => {
  const { data, error } = await supabase
    .from("feedback")
    .select(`
      id,
      created_at,
      rating,
      comment,
      impact,
      status,
      tags,
      food (
        name
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Lấy feedback theo order (admin / kiểm tra)
 */
export const getFeedbackByOrder = async (orderId) => {
  const { data, error } = await supabase
    .from("feedback")
    .select(`
      id,
      created_at,
      comment,
      impact,
      status,
      food (
        name
      ),
      users (
        email
      )
    `)
    .eq("order_id", orderId);

  if (error) throw error;
  return data;
};

/**
 * Cập nhật trạng thái / phản hồi (admin)
 */
export const updateFeedbackStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("feedback")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Xoá feedback (nếu cần)
 */
export const deleteFeedback = async (id) => {
  const { error } = await supabase
    .from("feedback")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};

const getAllFeedbacks = async (filters = {}) => {
  // Join with users table to get customer name
  let query = supabase
    .from('feedback')
    .select(`
      *,
      users:user_id (name, gmail),
      orders:order_id (id, status)
    `)
    .order('created_at', { ascending: false });

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,comment.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const getFeedbackById = async (id) => {
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      users:user_id (name, gmail),
      orders:order_id (id, status, price)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

const updateFeedback = async (id, updateData) => {
  const { data, error } = await supabase
    .from('feedback')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// feedback.dal.js - Thêm hàm
export const getFeedbackByUserWithFilter = async (userId, filters = {}) => {
  let query = supabase
    .from("feedback")
    .select(`
      id,
      created_at,
      rating,
      comment,
      impact,
      status,
      tags,
      title,
      order_id,
      food_id,
      food:food_id (
        id,
        name
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export {
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback
};

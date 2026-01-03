import { supabase } from "../database/supabase.js";

/* ================= CREATE ================= */

/**
 * Tạo feedback mới
 */
export const createFeedback = async (feedback) => {
  const insertData = {
    user_id: feedback.user_id,
    order_id: feedback.order_id,
    food_id: feedback.food_id,

    rating: feedback.rating ?? null,
    comment: feedback.comment ?? null,
    tags: feedback.tags ?? null,

    impact: feedback.impact ?? "Vừa",
    status: feedback.status ?? "Đang xử lý",
    type: feedback.type ?? "Issue",

    title: feedback.title ?? "New Feedback",
    date: feedback.date ?? new Date().toISOString(),
  };

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
      food:food_id (
        id,
        name
      )
    `)
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

/* ================= READ ================= */

/**
 * Lấy feedback theo ID (admin / detail)
 */
export const getFeedbackById = async (id) => {
  if (!id) throw new Error("Missing feedback id");

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
      title,
      type,
      date,
      users:user_id (
        id,
        name,
        gmail
      ),
      food:food_id (
        id,
        name
      ),
      orders:order_id (
        id
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

/**
 * Lấy feedback theo user_id (lịch sử người dùng)
 */
export const getFeedbackByUser = async (user_id) => {
  if (!user_id) throw new Error("Missing user_id");

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
      title,
      type,
      date,
      food:food_id (
        id,
        name
      )
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

/**
 * Lấy feedback theo order_id
 */
export const getFeedbackByOrder = async (order_id) => {
  if (!order_id) throw new Error("Missing order_id");

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
      title,
      type,
      date,
      users:user_id (
        id,
        email
      ),
      food:food_id (
        id,
        name
      )
    `)
    .eq("order_id", order_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const getAllFeedbacks = async (filters = {}) => {
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
      type,
      reply_text,
      users:user_id (
        id,
        name,
        gmail
      ),
      food:food_id (
        id,
        name
      ),
      orders:order_id (
        id
      )
    `)
    .order("created_at", { ascending: false });

  // ✅ SEARCH (CHỈ TRÊN BẢNG FEEDBACK)
  if (filters.search && filters.search.trim()) {
    const keyword = `%${filters.search.trim()}%`;

    query = query.or(
      `title.ilike.${keyword},comment.ilike.${keyword}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return data;
};


/* ================= UPDATE ================= */

/**
 * Cập nhật trạng thái feedback (user / admin)
 */
export const updateFeedbackStatus = async (id, status) => {
  if (!id) throw new Error("Missing feedback id");

  const validStatuses = ["Đang xử lý", "Đã phản hồi", "Đã đóng"];
  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const { data, error } = await supabase
    .from("feedback")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

/**
 * Cập nhật feedback (admin reply / update nhiều field)
 */
export const updateFeedback = async (id, updateData) => {
  if (!id) throw new Error("Missing feedback id");

  if (updateData.status) {
    const validStatuses = ["Đang xử lý", "Đã phản hồi", "Đã đóng"];
    if (!validStatuses.includes(updateData.status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }
  }

  const { data, error } = await supabase
    .from("feedback")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

/* ================= DELETE ================= */

/**
 * Xóa feedback theo id
 */
export const deleteFeedback = async (id) => {
  if (!id) throw new Error("Missing feedback id");

  const { error } = await supabase
    .from("feedback")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return true;
};

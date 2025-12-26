import { supabase } from "../database/supabase.js";

/**
 * Tạo phản ánh mới
 */
export const createFeedback = async (feedback) => {
  const { data, error } = await supabase
    .from("feedback")
    .insert([feedback])
    .select()
    .single();

  if (error) throw error;
  return data;
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

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

export {
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback
};

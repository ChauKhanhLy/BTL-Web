import { supabase } from "../database/supabase.js";

export const getAllOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) throw error;
  return data;
};

export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createOrder = async (order) => {
  try {
    console.log("Creating order in DB:", order);

    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error("Supabase create order error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Order created successfully:", data);
    return data;
  } catch (err) {
    console.error("createOrder DAL error:", err);
    throw new Error(`Không thể tạo đơn hàng: ${err.message}`);
  }
};

export const updateOrder = async (id, order) => {
  const { data, error } = await supabase
    .from("orders")
    .update(order)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteOrder = async (id) => {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
  return true;
};

export async function getOrdersByDate(startDate) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, date, price, status, paid")
    .gte("date", startDate);

  if (error) throw error;
  return data;
}

export const getOrdersByUser = async (userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getOrdersByUserAndDate = async (userId, fromDate, toDate) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      paid,
      payment_method,
      created_at,
      orderDetails (
        amount,
        food (
          name,
          price
        )
      )
    `
    )
    .eq("user_id", userId)
    .gte("created_at", fromDate.toISOString())
    .lte("created_at", toDate.toISOString());

  if (error) throw error;
  return data;
};
export async function getOrdersByDateAndRange(fromDate, toDate) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      price,
      paid,
      status,
      date,
      users (
        id,
        name
      )
    `
    )
    .gte("date", fromDate)
    .lte("date", toDate);

  if (error) throw error;

  return data.map((o) => ({
    id: o.id,
    user_id: o.users?.id,
    user_name: o.users?.name, // ✅ CÓ user_name
    price: o.price,
    paid: o.paid,
    status: o.status,
    date: o.date,
  }));
}



// Thêm function kiểm tra có thể hủy không
export const cancelOrder = async (id, userId, reason = null) => {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Đơn hàng không tồn tại");
  if (order.user_id !== userId)
    throw new Error("Không có quyền hủy đơn hàng này");

  if (order.status === "cancelled")
    throw new Error("Đơn hàng đã bị hủy");

  if (order.paid)
    throw new Error("Đơn hàng đã thanh toán, không thể hủy");

  // ✅ LOGIC ĐÚNG
  const mealDate = new Date(order.date);
  const cutoffDate = new Date(mealDate);
  cutoffDate.setDate(cutoffDate.getDate() + 1);
  cutoffDate.setHours(0, 0, 0, 0);

  if (new Date() >= cutoffDate) {
    throw new Error("Quá thời gian hủy");
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      paid: false,
      updated_at: new Date().toISOString(),
      note: reason
        ? `${order.note ?? ""}\nĐã hủy: ${reason}`
        : `${order.note ?? ""}\nĐã hủy`,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw updateError;

  return updatedOrder;
};

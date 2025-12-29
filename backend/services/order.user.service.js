import * as orderDAL from "../dal/orders.dal.js";
import { supabase } from "../database/supabase.js";

/* =====================
   USER – LỊCH SỬ ORDER
===================== */
export async function getUserOrders(userId) {
  if (!userId) throw new Error("Missing user_id");

  return await orderDAL.getOrdersByUser(userId);
}

/* =====================
   USER – THỐNG KÊ
===================== */
export async function getUserStats(userId, range = "all") {
  const orders = await orderDAL.getOrdersByUser(userId);

  const now = new Date();
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month") return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  return {
    total: filtered.length,
    paid: filtered.filter(o => o.paid).reduce((s, o) => s + o.price, 0),
    unpaid: filtered.filter(o => !o.paid).reduce((s, o) => s + o.price, 0),
  };
}

/* =====================
   USER – CHECKOUT
===================== */
export async function checkout({ user_id, cart, address, note }) {
  if (!cart || cart.length === 0) {
    throw new Error("Cart is empty");
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // 1. tạo order
  const order = await orderDAL.createOrder({
    user_id,
    address,
    note,
    total_price: total,
    status: "pending",
    paid: false,
  });

  // 2. tạo order_details
  const details = cart.map(item => ({
    order_id: order.id,
    food_id: item.id,
    quantity: item.qty,
    price: item.price,
  }));

  const { error } = await supabase
    .from("order_details")
    .insert(details);

  if (error) throw error;

  return {
    message: "Checkout success",
    order_id: order.id,
  };
}

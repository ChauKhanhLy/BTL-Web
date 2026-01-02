import * as orderDAL from "../dal/orders.dal.js";
import * as orderDetailDAL from "../dal/orderDetail.dal.js";

import { payByMealCard } from "./mealWallet.service.js";

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
  const filtered = orders.filter((o) => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month")
      return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  return {
    total: filtered.length,
    paid: filtered.filter((o) => o.paid).reduce((s, o) => s + o.price, 0),
    unpaid: filtered
      .filter((o) => !o.paid)
      .reduce((s, o) => s + o.price, 0),
  };
}

/* =====================
   USER – CHECKOUT
===================== */


export async function checkout({ user_id, cart, payment_method, note }) {
  if (!user_id || !cart || cart.length === 0) throw new Error("Giỏ hàng trống");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let paid = false;
  let status = "pending";

  // 1. Xử lý thanh toán thẻ
  if (payment_method === "meal_card") {
    await payByMealCard({ userId: user_id, amount: total });
    paid = true;
    status = "completed";
  }

  // 2. Tạo đơn hàng chính (Table: orders)
  const order = await orderDAL.createOrder({
    user_id,
    price: total,
    payment_method,
    paid,
    status,
    note,
  });

  // 3. Lưu chi tiết từng món (Table: orderDetails)
  // Duyệt qua cart để tạo record cho mỗi món
  const detailPromises = cart.map((item) =>
    orderDetailDAL.createOrderDetail({
      order_id: order.id,
      food_id: item.id, // Đảm bảo item.id là id của món ăn trong DB
      amount: item.qty,
      price: item.price, // Lưu giá tại thời điểm mua
    })
  );

  await Promise.all(detailPromises);

  return {
    order_id: order.id,
    paid,
    status,
    status_label: status === "completed" ? "Đã thanh toán" : "Chờ thanh toán",
  };
}



export async function getUserPaymentStats(userId, range = "month") {
  if (!userId) throw new Error("Missing user_id");

  const orders = await orderDAL.getOrdersByUser(userId);

  const now = new Date();
  const filtered = orders.filter((o) => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month")
      return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  const total = filtered.reduce((s, o) => s + o.price, 0);

  const paid = filtered
    .filter((o) => o.paid)
    .reduce((s, o) => s + o.price, 0);

  const debt = filtered
    .filter((o) => !o.paid)
    .reduce((s, o) => s + o.price, 0);

  const mealCardDebt = filtered
    .filter((o) => o.payment_method === "meal_card" && !o.paid)
    .reduce((s, o) => s + o.price, 0);

  return {
    total_orders: filtered.length,
    total_amount: total,
    paid_amount: paid,
    debt_amount: debt,
    meal_card_debt: mealCardDebt,
  };
}

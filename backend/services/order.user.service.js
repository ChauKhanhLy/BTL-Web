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
export async function checkout({
  user_id,
  cart,
  payment_method,
  address,
  note,
}) {
  if (!user_id) throw new Error("Missing user_id");
  if (!cart || cart.length === 0) throw new Error("Cart empty");

  if (!["cash", "meal_card"].includes(payment_method)) {
    throw new Error("Phương thức thanh toán không hợp lệ");
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // mặc định
  let paid = false;

  // tiền mặt → admin xác nhận sau
  if (payment_method === "cash") {
    paid = false;
  }

  // thẻ ăn → trừ nếu còn tiền
  if (payment_method === "meal_card") {
    // LẤY SỐ DƯ THẺ
    const { data: wallet } = await supabase
      .from("meal_wallets")
      .select("*")
      .eq("user_id", user_id)
      .single();

    const balance = wallet?.balance || 0;

    if (balance >= total) {
      // đủ tiền → trừ luôn
      await supabase
        .from("meal_wallets")
        .update({ balance: balance - total })
        .eq("user_id", user_id);

      paid = true;
    } else {
      // không đủ → ghi nợ
      paid = false;
    }
  }

  const order = await orderDAL.createOrder({
    user_id,
    total_price: total,
    payment_method,
    paid,
    status: "pending",
  });

  const details = cart.map(item => ({
    order_id: order.id,
    food_id: item.id,
    quantity: item.qty,
    price: item.price,
  }));

  await supabase.from("order_details").insert(details);

  return {
    order_id: order.id,
    paid,
    message: paid
      ? "Thanh toán thành công"
      : "Đã ghi nhận, chờ thanh toán",
  };
}

export async function getUserPaymentStats(userId, range = "month") {
  if (!userId) throw new Error("Missing user_id");

  const orders = await orderDAL.getOrdersByUser(userId);

  const now = new Date();
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month") return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  const total = filtered.reduce((s, o) => s + o.total_price, 0);

  const paid = filtered
    .filter(o => o.paid)
    .reduce((s, o) => s + o.total_price, 0);

  const debt = filtered
    .filter(o => !o.paid)
    .reduce((s, o) => s + o.total_price, 0);

  const mealCardDebt = filtered
    .filter(o => o.payment_method === "meal_card" && !o.paid)
    .reduce((s, o) => s + o.total_price, 0);

  return {
    total_orders: filtered.length,
    total_amount: total,
    paid_amount: paid,
    debt_amount: debt,
    meal_card_debt: mealCardDebt,
  };
}

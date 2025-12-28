import * as orderDAL from "../dal/orders.dal.js";

export async function getUserOrders(userId) {
  if (!userId) throw new Error("Missing user_id");

  const orders = await orderDAL.getOrdersByUser(userId);

  return orders.map(o => ({
    id: o.id,
    date: o.created_at,
    name: o.food_name,
    price: o.price,
    paid: o.paid
  }));
}

export async function getUserStats(userId, range) {
  const orders = await orderDAL.getOrdersByUser(userId);

  // lọc theo thời gian
  const now = new Date();
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month") return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  const paid = filtered.filter(o => o.paid).reduce((s, o) => s + o.price, 0);
  const unpaid = filtered.filter(o => !o.paid).reduce((s, o) => s + o.price, 0);

  return {
    total: filtered.length,
    paid,
    unpaid
  };
}

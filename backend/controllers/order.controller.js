import * as orderService from "../services/order.service.js";
import * as userOrderService from "../services/order.user.service.js";
import { getMealStats, getStatsSummary } from "../services/stats.service.js";
import { confirmCashPayment } from "../services/order.service.js";
/**
 * POST /api/orders/checkout
 */
export async function checkout(req, res) {
  try {
    const result = await orderService.checkout(req.body);
    res.json(result);
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/orders/stats?range=week
 */
export async function getOrderStats(req, res) {
  try {
    const { range } = req.query;
    const data = await orderService.getOrderStats(range);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const getRecentOrders = async (req, res) => {
  const { user_id } = req.query;

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      orderDetails (
        food ( name )
      )
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) return res.status(500).json({ error: error.message });

  const result = data.map(order => ({
    id: order.id,
    orderId: `#${order.id.slice(0, 6)}`,
    time: new Date(order.created_at).toLocaleString(),
    items: order.orderDetails.map(d => d.food.name)
  }));

  res.json(result);
};

/**
 * ADMIN xác nhận thanh toán tiền mặt
 * PUT /api/orders/:id/confirm-cash
 */
export async function confirmCash(req, res) {
  try {
    const { id } = req.params;
    const result = await confirmCashPayment(id);
    res.json({
      message: "Đã xác nhận thanh toán tiền mặt",
      order: result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * ======================
 * USER APIs
 * ======================
 */

/**
 * USER checkout từ giỏ hàng
 * POST /api/orders/user/checkout
 */
export async function userCheckout(req, res) {
  try {
    //console.log("CHECKOUT BODY >>>", req.body);
    const result = await userOrderService.checkout(req.body);
    res.json(result);
  } catch (err) {
    //console.error("CHECKOUT ERROR >>>", err.message);
    res.status(400).json({ error: err.message });
  }
}

/**
 * USER xem lịch sử đơn hàng
 * GET /api/orders/user/:userId
 */
export async function getUserOrders(req, res) {
  try {
    const { userId } = req.params;
    const orders = await userOrderService.getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * USER xem 3 đơn gần nhất
 * GET /api/orders/user/recent?user_id=xxx
 */
export async function getUserRecentOrders(req, res) {
  try {
    const { user_id } = req.query;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        orderDetails (
          food ( name )
        )
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) throw error;

    const result = data.map(order => ({
      id: order.id,
      orderId: `#${order.id.slice(0, 6)}`,
      time: new Date(order.created_at).toLocaleString(),
      items: order.orderDetails.map(d => d.food.name),
    }));

    res.json(result);
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * USER – Thống kê thanh toán
 * GET /api/orders/user/stats?user_id=xxx&range=month
 */
export async function getUserStats(req, res) {
  try {
    const { user_id, range } = req.query;
    const stats = await userOrderService.getUserPaymentStats(user_id, range);
    res.json(stats);
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}



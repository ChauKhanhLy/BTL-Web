import * as orderService from "../services/order.service.js";
import * as userOrderService from "../services/order.user.service.js";
import { supabase } from "../database/supabase.js";

/* ================= UTIL ================= */

function normalizeRangeQuery(query) {
  // FE gửi dạng: range[range], range[date]
  if (typeof query.range === "object" && query.range !== null) {
    return {
      range: query.range.range,
      date: query.range.date,
    };
  }

  // FE gửi dạng chuẩn
  return {
    range: query.range,
    date: query.date,
  };
}

/* ================= ADMIN ================= */

/**
 * POST /api/orders/checkout
 */
export async function checkout(req, res) {
  try {
    const result = await orderService.checkout(req.body);
    res.json(result);
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/orders/stats?range=week&date=YYYY-MM-DD
 */
export async function getOrderStats(req, res) {
  try {
    const { range, date } = normalizeRangeQuery(req.query);
    const data = await orderService.getOrderStats(range, date);
    res.json(data);
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/orders?range=week&date=YYYY-MM-DD
 */
export async function getOrdersByDate(req, res) {
  try {
    const { range, date } = normalizeRangeQuery(req.query);
    const orders = await orderService.getOrdersByRangeAndDate(range, date);
    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * PUT /api/orders/:id/confirm-paid
 */
export async function confirmCash(req, res) {
  try {
    const { id } = req.params;
    const result = await orderService.confirmCashPayment(id);
    res.json({
      message: "Đã xác nhận thanh toán tiền mặt",
      order: result,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/orders/dashboard?range=week&date=YYYY-MM-DD
 */
export async function getDashboard(req, res) {
  try {
    const { range, date } = normalizeRangeQuery(req.query);
    const dashboard = await orderService.getDashboardData(range, date);
    res.json(dashboard);
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

/* ================= USER ================= */

/**
 * POST /api/orders/user/checkout
 */
export async function userCheckout(req, res) {
  try {
    const result = await userOrderService.checkout(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
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
    console.error("RECENT ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/orders/user/stats?user_id=xxx&range=month
 */
export async function getUserStats(req, res) {
  try {
    const { user_id, range } = req.query;
    const stats = await userOrderService.getUserPaymentStats(user_id, range);
    res.json(stats);
  } catch (err) {
    console.error("USER STATS ERROR:", err);
    res.status(400).json({ error: err.message });
  }
}

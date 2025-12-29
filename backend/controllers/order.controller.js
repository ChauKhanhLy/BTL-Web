
/*
export async function getMyOrders(req, res) {
  try {
    const { user_id } = req.query;
    const data = await userOrderService.getUserOrders(user_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getMyStats(req, res) {
  try {
    const { user_id, range } = req.query;
    const data = await userOrderService.getUserStats(user_id, range);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}*/
import * as orderService from "../services/order.service.js";

/**
 * POST /api/orders/checkout
 */
export async function checkout(req, res) {
  try {
    const result = await orderService.checkout(req.body);
    res.json(result);
  } catch (err) {
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

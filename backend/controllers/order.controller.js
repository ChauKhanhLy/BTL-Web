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

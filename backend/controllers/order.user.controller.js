import * as userOrderService from "../services/order.user.service.js";

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
}
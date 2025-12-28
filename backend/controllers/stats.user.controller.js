import { getMealStats } from "../services/stats.user.service.js";

export async function getStats(req, res) {
  try {
    const { user_id, filter = "today", date } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const data = await getMealStats({ user_id, filter, date });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
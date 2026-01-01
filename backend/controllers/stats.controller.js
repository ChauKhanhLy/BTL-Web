import * as statsService from "../services/stats.service.js";

export async function getChartData(req, res) {
  try {
    const { user_id, filter = "month" } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const data = await statsService.getChartDataService({ user_id, filter });
    res.json(data);
  } catch (err) {
    console.error("Get chart data error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTopFoods(req, res) {
  try {
    const { user_id, limit = 5, filter = "all" } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    // Dùng hàm với filter
    const data = await statsService.getTopFoodsWithFilter({ 
      user_id, 
      limit: parseInt(limit),
      filter
    });
    res.json(data);
  } catch (err) {
    console.error("Get top foods error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getPaymentMethodStats(req, res) {
  try {
    const { user_id, filter = "all" } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    // Dùng hàm với filter
    const data = await statsService.getPaymentStatsWithFilter({ 
      user_id, 
      filter 
    });
    res.json(data);
  } catch (err) {
    console.error("Get payment stats error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Giữ các hàm cũ
export async function getStats(req, res) {
  try {
    const { user_id, filter = "today", date } = req.query;
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });
    const data = await statsService.getMealStats({ user_id, filter, date });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSummary(req, res) {
  try {
    const { user_id, filter = "today", date } = req.query;
    const data = await statsService.getStatsSummary({ user_id, filter, date });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
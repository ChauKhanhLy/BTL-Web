import { supabase } from "../database/supabase.js";

export const getMealStats = async (req, res) => {
  try {
    const { user_id, filter = "today", date } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const baseDate = date ? new Date(date) : new Date();

    let fromDate = null;
    let toDate = null;

    // ===== XÁC ĐỊNH KHOẢNG THỜI GIAN =====
    if (filter === "today") {
      fromDate = new Date(baseDate);
      fromDate.setHours(0, 0, 0, 0);

      toDate = new Date(baseDate);
      toDate.setHours(23, 59, 59, 999);
    }

    if (filter === "week") {
      fromDate = new Date(baseDate);
      fromDate.setDate(baseDate.getDate() - baseDate.getDay());
      fromDate.setHours(0, 0, 0, 0);

      toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
    }

    if (filter === "month") {
      fromDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      toDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      toDate.setHours(23, 59, 59, 999);
    }

    if (filter === "year") {
      fromDate = new Date(baseDate.getFullYear(), 0, 1);
      toDate = new Date(baseDate.getFullYear(), 11, 31);
      toDate.setHours(23, 59, 59, 999);
    }

    // ===== QUERY SUPABASE =====
    let query = supabase
      .from("orders")
      .select(`
        date,
        paid,
        orderDetails (
          amount,
          food (
            name,
            price
          )
        )
    `)
      .eq("user_id", user_id);

    if (fromDate && toDate) {
      query = query
        .gte("date", fromDate.toISOString())
        .lte("date", toDate.toISOString());
    }

    const { data, error } = await query.order("dateh", {
      ascending: false,
    });

    if (error) throw error;

    // ===== FLATTEN DATA =====
    const meals = [];

    data.forEach((order) => {
      order.orderDetails.forEach((item) => {
        meals.push({
          date: order.date.slice(0, 10),
          name: item.food.name,
          price: item.food.price * item.amount,
          paid: order.paid,
        });
      });
    });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

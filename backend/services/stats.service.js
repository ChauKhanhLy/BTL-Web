// stats.service.js - Sửa hàm getChartData
import * as orderDAL from "../dal/orders.dal.js";
import { supabase } from "../database/supabase.js";

// ==================== HÀM CHART DATA ====================
// SỬA HÀM NÀY:
export async function getChartDataService({ user_id, filter = "month" }) {
  try {
    const now = new Date();
    let fromDate, toDate;

    switch (filter) {
      case "today":
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "year":
        fromDate = new Date(now.getFullYear(), 0, 1);
        toDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        fromDate = null;
        toDate = null;
    }

    // Query orders với details để tính tổng đúng
    let query = supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        paid,
        payment_method,
        orderDetails (
          amount,
          price,
          original_price
        )
      `
      )
      .eq("user_id", user_id);

    if (fromDate) {
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (toDate) {
      query = query.lte("created_at", toDate.toISOString());
    }

    query = query.order("created_at", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Nhóm dữ liệu
    const groupedData = {};

    data?.forEach((order) => {
      // Tính tổng tiền THỰC TẾ từ orderDetails
      const orderTotal =
        order.orderDetails?.reduce((sum, detail) => {
          return (
            sum +
            (detail.price || detail.original_price || 0) * (detail.amount || 0)
          );
        }, 0) || 0;

      const date = new Date(order.created_at);
      let timeKey;

      if (filter === "year") {
        timeKey = date.toISOString().slice(0, 7); // YYYY-MM
      } else {
        timeKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      if (!groupedData[timeKey]) {
        groupedData[timeKey] = {
          time: timeKey,
          total: 0,
          paid: 0,
          unpaid: 0,
          count: 0,
        };
      }

      groupedData[timeKey].total += orderTotal;
      groupedData[timeKey].count += 1;

      // Phân loại đã/chưa thanh toán
      if (order.paid) {
        groupedData[timeKey].paid += orderTotal;
      } else {
        groupedData[timeKey].unpaid += orderTotal;
      }
    });

    // Chuyển thành array
    return Object.values(groupedData).sort((a, b) => {
      if (filter === "year") {
        return a.time.localeCompare(b.time);
      }
      return new Date(a.time) - new Date(b.time);
    });
  } catch (err) {
    console.error("Error in getChartDataService:", err);
    throw err;
  }
}

// ==================== HÀM TOP FOODS CƠ BẢN ====================
export async function getTopFoodsBasic({ user_id, limit = 5 }) {
  try {
    console.log("getTopFoodsBasic called for user:", user_id);

    // Lấy tất cả orders của user
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user_id);

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      console.log("No orders found for user");
      return [];
    }

    const orderIds = orders.map((o) => o.id);
    console.log("Order IDs:", orderIds);

    // Lấy order details với price từ food table
    const { data: details, error: detailsError } = await supabase
      .from("orderDetails")
      .select(
        `
        amount,
        price,
        food:food_id(
          id,
          name,
          price
        )
      `
      )
      .in("order_id", orderIds);

    if (detailsError) {
      console.error("Error fetching order details:", detailsError);
      throw detailsError;
    }

    console.log("Order details found:", details?.length);

    // Nhóm theo món ăn
    const foodStats = {};

    details?.forEach((item) => {
      const foodId = item.food?.id;
      const foodName = item.food?.name || "Không tên";
      // Ưu tiên dùng price từ orderDetails, nếu không có thì dùng từ food
      const foodPrice = item.price || item.food?.price || 0;
      const amount = item.amount || 0;
      const totalRevenue = foodPrice * amount;

      if (!foodStats[foodId]) {
        foodStats[foodId] = {
          id: foodId,
          name: foodName,
          totalAmount: 0,
          totalRevenue: 0,
          count: 0,
          price: foodPrice,
        };
      }

      foodStats[foodId].totalAmount += amount;
      foodStats[foodId].totalRevenue += totalRevenue;
      foodStats[foodId].count += 1;
    });

    // Chuyển thành array và sắp xếp
    const result = Object.values(foodStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);

    console.log("Top foods result:", result);
    return result;
  } catch (err) {
    console.error("Error in getTopFoodsBasic:", err);
    throw err;
  }
}

// ==================== HÀM TOP FOODS VỚI FILTER ====================
export async function getTopFoodsWithFilter({
  user_id,
  limit = 5,
  filter = "all",
}) {
  try {
    console.log("getTopFoodsWithFilter called:", { user_id, limit, filter });

    const now = new Date();
    let fromDate = null;
    let toDate = null;

    // Xác định khoảng thời gian theo filter
    switch (filter) {
      case "today":
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        toDate.setHours(23, 59, 59, 999);
        break;
      case "year":
        fromDate = new Date(now.getFullYear(), 0, 1);
        toDate = new Date(now.getFullYear(), 11, 31);
        toDate.setHours(23, 59, 59, 999);
        break;
      default:
        // "all" - không filter
        break;
    }

    // Lấy orders của user với filter thời gian
    let query = supabase
      .from("orders")
      .select("id, created_at")
      .eq("user_id", user_id);

    if (fromDate) {
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (toDate) {
      query = query.lte("created_at", toDate.toISOString());
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      console.log("No orders found for user with filter:", filter);
      return [];
    }

    const orderIds = orders.map((o) => o.id);
    console.log(`Found ${orderIds.length} orders for filter ${filter}`);

    // Lấy order details
    const { data: details, error: detailsError } = await supabase
      .from("orderDetails")
      .select(
        `
        amount,
        price,
        food:food_id(
          id,
          name,
          price
        )
      `
      )
      .in("order_id", orderIds);

    if (detailsError) throw detailsError;

    // Nhóm theo món ăn
    const foodStats = {};

    details?.forEach((item) => {
      const foodId = item.food?.id;
      const foodName = item.food?.name || "Không tên";
      const foodPrice = item.price || item.food?.price || 0;
      const amount = item.amount || 0;
      const totalRevenue = foodPrice * amount;

      if (!foodStats[foodId]) {
        foodStats[foodId] = {
          id: foodId,
          name: foodName,
          totalAmount: 0,
          totalRevenue: 0,
          count: 0,
          price: foodPrice,
        };
      }

      foodStats[foodId].totalAmount += amount;
      foodStats[foodId].totalRevenue += totalRevenue;
      foodStats[foodId].count += 1;
    });

    // Chuyển thành array và sắp xếp
    const result = Object.values(foodStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);

    console.log(`Top foods for filter ${filter}:`, result);
    return result;
  } catch (err) {
    console.error("Error in getTopFoodsWithFilter:", err);
    throw err;
  }
}

// ==================== HÀM PAYMENT STATS CƠ BẢN ====================
export async function getPaymentMethodStats({ user_id }) {
  try {
    // Query đơn giản
    const { data, error } = await supabase
      .from("orders")
      .select("payment_method, price, paid")
      .eq("user_id", user_id);

    if (error) throw error;

    const stats = {
      cash: { total: 0, count: 0 },
      meal_card: { total: 0, count: 0 },
      banking: { total: 0, count: 0 },
    };

    data?.forEach((order) => {
      const method = order.payment_method || "cash";
      const price = parseFloat(order.price) || 0;

      if (stats[method]) {
        stats[method].total += price;
        stats[method].count += 1;
      }
    });

    return stats;
  } catch (err) {
    console.error("Error in getPaymentMethodStats:", err);
    throw err;
  }
}

// ==================== HÀM PAYMENT STATS VỚI FILTER ====================
export async function getPaymentStatsWithFilter({ user_id, filter = "all" }) {
  try {
    const now = new Date();
    let fromDate = null;
    let toDate = null;

    // Xác định khoảng thời gian theo filter
    switch (filter) {
      case "today":
        fromDate = new Date(now);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now);
        toDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        toDate.setHours(23, 59, 59, 999);
        break;
      case "year":
        fromDate = new Date(now.getFullYear(), 0, 1);
        toDate = new Date(now.getFullYear(), 11, 31);
        toDate.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }

    // Query với filter
    let query = supabase
      .from("orders")
      .select("payment_method, price, paid")
      .eq("user_id", user_id);

    if (fromDate) {
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (toDate) {
      query = query.lte("created_at", toDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      cash: { total: 0, count: 0 },
      meal_card: { total: 0, count: 0 },
      banking: { total: 0, count: 0 },
    };

    data?.forEach((order) => {
      const method = order.payment_method || "cash";
      const price = parseFloat(order.price) || 0;

      if (stats[method]) {
        stats[method].total += price;
        stats[method].count += 1;
      }
    });

    return stats;
  } catch (err) {
    console.error("Error in getPaymentStatsWithFilter:", err);
    throw err;
  }
}

export async function getMealStats({ user_id, filter, date }) {
  const baseDate = date ? new Date(date) : new Date();

  let fromDate, toDate;

  switch (filter) {
    case "week": {
      fromDate = new Date(baseDate);
      fromDate.setDate(baseDate.getDate() - baseDate.getDay());
      fromDate.setHours(0, 0, 0, 0);

      toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
      break;
    }

    case "month": {
      fromDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      toDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      toDate.setHours(23, 59, 59, 999);
      break;
    }

    case "year": {
      fromDate = new Date(baseDate.getFullYear(), 0, 1);
      toDate = new Date(baseDate.getFullYear(), 11, 31);
      toDate.setHours(23, 59, 59, 999);
      break;
    }

    case "today":
    case "day":
    default: {
      fromDate = new Date(baseDate);
      fromDate.setHours(0, 0, 0, 0);

      toDate = new Date(baseDate);
      toDate.setHours(23, 59, 59, 999);
    }
  }

  const orders = await orderDAL.getOrdersByUserAndDate(
    user_id,
    fromDate,
    toDate
  );

  const meals = [];

  orders.forEach((order) => {
    if (Array.isArray(order.orderDetails)) {
      order.orderDetails.forEach((item) => {
        meals.push({
          date: order.created_at.slice(0, 10),
          name: item.food?.name ?? "Không tên",
          price: item.food?.price * item.amount || 0,
          paid: order.paid,
          payment_method: order.payment_method,
        });
      });
    }
  });

  return meals;
}

export async function getStatsSummary({ user_id, filter, date }) {
  const meals = await getMealStats({ user_id, filter, date });

  const summary = {
    total_meals: meals.length,
    total_amount: 0,
    paid: 0,
    unpaid: 0,
    meal_card_debt: 0,
  };

  meals.forEach((m) => {
    summary.total_amount += m.price;

    if (m.paid) {
      summary.paid += m.price;
    } else {
      summary.unpaid += m.price;

      if (m.payment_method === "meal_card") {
        summary.meal_card_debt += m.price;
      }
    }
  });

  return summary;
}

export const getOrdersByUserWithDetails = async (userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      paid,
      payment_method,
      status,
      created_at,
      orderDetails (
        amount,
        food (
          id,
          name,
          price
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

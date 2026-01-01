import * as orderService from "../services/order.service.js";
import * as userOrderService from "../services/order.user.service.js";
import { getMealStats, getStatsSummary } from "../services/stats.service.js";
import { confirmCashPayment } from "../services/order.service.js";
import { supabase } from "../database/supabase.js";

/**
 /* POST /api/orders/checkout
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
// Sửa hàm userCheckout - thêm try-catch
export async function userCheckout(req, res) {
  try {
    console.log("CHECKOUT BODY >>>", req.body);
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: "Invalid request body" });
    }
    
    const { user_id, cart, payment_method, note } = req.body;
    
    // Validation
    if (!user_id) {
      return res.status(400).json({ error: "Thiếu user_id" });
    }
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Giỏ hàng trống" });
    }
    
    if (!payment_method || !["cash", "meal_card", "banking"].includes(payment_method)) {
      return res.status(400).json({ error: "Phương thức thanh toán không hợp lệ" });
    }
    
    const result = await userOrderService.checkout(req.body);
    res.json(result);
    
  } catch (err) {
    console.error("CHECKOUT ERROR >>>", err.message);
    console.error("Stack trace:", err.stack);
    
    // Trả về lỗi cụ thể
    res.status(400).json({ 
      error: err.message || "Lỗi khi thanh toán",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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

// order.controller.js - sửa hàm getUserOrderDetails
// order.controller.js - Sửa hàm getUserOrderDetails
export async function getUserOrderDetails(req, res) {
  try {
    const { userId } = req.params;
    console.log("Getting order details for user:", userId);
    
    // QUERY ĐÚNG - KHÔNG CÓ COMMENT
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        paid,
        payment_method,
        status,
        note,
        orderDetails (
          id,
          order_id,
          food_id,
          amount,
          food:food_id(
            id,
            name,
            price,
            image_url
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log(`Found ${orders?.length || 0} orders for user`);
    
    // Format data đơn giản
    const formattedOrders = orders?.map(order => {
      // Tính tổng tiền cho order
      const orderTotal = order.orderDetails?.reduce((sum, detail) => {
        const itemPrice = detail.food?.price || 0;
        const itemAmount = detail.amount || 0;
        return sum + (itemPrice * itemAmount);
      }, 0) || 0;
      
      return {
        id: order.id,
        created_at: order.created_at,
        paid: order.paid || false,
        payment_method: order.payment_method || 'cash',
        status: order.paid ? "Đã thanh toán" : "Chưa thanh toán",
        note: order.note || "",
        orderDetails: order.orderDetails?.map(detail => ({
          id: detail.id,
          order_id: detail.order_id,
          food_id: detail.food_id,
          amount: detail.amount,
          price: detail.food?.price || 0,
          food_name: detail.food?.name || "Không tên",
          image_url: detail.food?.image_url,
          total: (detail.food?.price || 0) * (detail.amount || 0)
        })) || [],
        total: orderTotal
      };
    }) || [];
    
    res.json(formattedOrders);
    
  } catch (err) {
    console.error("Get user order details error:", err);
    res.status(500).json({ error: err.message });
  }
}
/**
 * GET /api/orders/:id/details
 * Lấy chi tiết đơn hàng với thông tin món ăn
*/
// order.controller.js
export async function getOrderDetails(req, res) {
  try {
    const { id } = req.params;
    console.log("Getting details for order:", id);
    
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // ĐÚNG: KHÔNG có comment trong chuỗi select
    const { data, error } = await supabase
      .from("orderDetails")
      .select(`
        id,
        order_id,
        food_id,
        amount,
        price,
        original_price,
        is_combo_item,
        food:food_id(
          id,
          name,
          price,
          image_url,
          description
        )
      `)
      .eq("order_id", id);
    
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ 
        error: "Không thể lấy chi tiết đơn hàng",
        details: error.message 
      });
    }
    
    console.log("Found details:", data?.length || 0);
    
    // Format response
    const details = data.map(item => ({
      id: item.id,
      order_id: item.order_id,
      food_id: item.food_id,
      amount: item.amount,
      // Ưu tiên dùng price từ orderDetails (giá đã thanh toán)
      price: item.price || item.food?.price || 0,
      // Nếu không có original_price thì dùng giá từ food
      original_price: item.original_price || item.food?.price || item.price || 0,
      is_combo_item: item.is_combo_item || false,
      food_name: item.food?.name || "Không tên",
      food_image: item.food?.image_url,
      food_description: item.food?.description || "",
      food_price: item.food?.price || 0, // Giá gốc từ food
      total: (item.price || item.food?.price || 0) * item.amount
    }));
    
    res.json(details || []);
    
  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({ 
      error: "Không thể lấy chi tiết đơn hàng",
      details: err.message
    });
  }
}
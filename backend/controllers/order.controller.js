import * as orderService from "../services/order.service.js";
import * as userOrderService from "../services/order.user.service.js";
import { getMealStats, getStatsSummary } from "../services/stats.service.js";
import { confirmCashPayment } from "../services/order.service.js";
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
 /* POST /api/orders/checkout
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
/*export async function getUserRecentOrders(req, res) {
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
}*/
// order.controller.js - Sửa hàm getUserRecentOrders
export async function getUserRecentOrders(req, res) {
  try {
    const { user_id } = req.query;
    
    console.log("🔍 [getUserRecentOrders] Getting real orders for user:", user_id);
    
    if (!user_id) {
      return res.status(400).json({ 
        error: "Thiếu user_id",
        message: "Vui lòng cung cấp user_id" 
      });
    }

    // 1. Lấy danh sách orders gần đây của user
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        price,
        payment_method,
        paid,
        status
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error("❌ Error fetching orders:", ordersError);
      throw ordersError;
    }

    console.log(`📦 Found ${orders?.length || 0} orders for user ${user_id}`);

    if (!orders || orders.length === 0) {
      return res.json([]); // Trả về mảng rỗng nếu không có đơn hàng
    }

    // 2. Lấy chi tiết cho từng order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          // Lấy orderDetails cho order này
          const { data: details, error: detailsError } = await supabase
            .from("orderDetails")
            .select(`
              id,
              food_id,
              amount,
              food:food_id (
                id,
                name
              )
            `)
            .eq("order_id", order.id);

          if (detailsError) {
            console.error(`Error fetching details for order ${order.id}:`, detailsError);
            return {
              ...order,
              items: []
            };
          }

          // Format items từ details
          const items = details?.map(detail => ({
            id: detail.food?.id || detail.food_id,
            name: detail.food?.name || "Món không xác định"
          })) || [];

          // Format response - SỬA TẠI ĐÂY
          return {
            id: order.id,
            orderId: `#${String(order.id).slice(-6).padStart(6, '0')}`,
            created_at: new Date(order.created_at).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            // QUAN TRỌNG: Đảm bảo id là string để so sánh
            _id: order.id.toString(),
            items: items,
            price: order.price,
            paid: order.paid,
            payment_method: order.payment_method,
            status: order.status
          };
        } catch (err) {
          console.error(`Error processing order ${order.id}:`, err);
          return {
            id: order.id,
            orderId: `#${String(order.id).slice(-6)}`,
            created_at: new Date(order.created_at).toLocaleString('vi-VN'),
            _id: order.id.toString(),
            items: []
          };
        }
      })
    );

    // Sort lại theo thời gian (mới nhất đầu tiên)
    ordersWithDetails.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    console.log("✅ [getUserRecentOrders] Returning real data:", ordersWithDetails.length, "orders");
    res.json(ordersWithDetails);
    
  } catch (err) {
    console.error(" [getUserRecentOrders] ERROR:", err);
    res.status(500).json({ 
      error: "Không thể lấy đơn hàng gần đây",
      message: err.message 
    });
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


// dành cho feedback của user
export async function getRecentOrders(req, res) {
  console.log("🚀 getRecentOrders CALLED!");
  console.log("📋 Query params:", req.query);
  console.log("📋 user_id:", req.query.user_id);
  
  try {
    // Trả về dữ liệu test ngay lập tức
    const testData = [
      {
        id: "test-1",
        orderId: "#1001",
        created_at: "01/01/2024, 10:30",
        items: [
          { id: 1, name: "Cơm gà xối mỡ" },
          { id: 2, name: "Canh rau củ" }
        ]
      },
      {
        id: "test-2",
        orderId: "#1002",
        created_at: "02/01/2024, 11:45",
        items: [
          { id: 3, name: "Phở bò tái" }
        ]
      }
    ];
    
    console.log("✅ Returning test data:", testData);
    return res.json(testData);
    
  } catch (err) {
    console.error("❌ Error in getRecentOrders:", err);
    return res.status(500).json({ error: err.message });
  }
}
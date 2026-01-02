import * as orderDAL from "../dal/orders.dal.js";
import * as orderDetailDAL from "../dal/orderDetail.dal.js";
import { supabase } from "../database/supabase.js";
import { payByMealCard } from "./mealWallet.service.js";

/* =====================
   USER – LỊCH SỬ ORDER
===================== */
export async function getUserOrders(userId) {
  if (!userId) throw new Error("Missing user_id");

  return await orderDAL.getOrdersByUser(userId);
}

/* =====================
   USER – THỐNG KÊ
===================== */
export async function getUserStats(userId, range = "all") {
  const orders = await orderDAL.getOrdersByUser(userId);

  const now = new Date();
  const filtered = orders.filter((o) => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month")
      return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  return {
    total: filtered.length,
    paid: filtered.filter((o) => o.paid).reduce((s, o) => s + o.price, 0),
    unpaid: filtered
      .filter((o) => !o.paid)
      .reduce((s, o) => s + o.price, 0),
  };
}

/* =====================
   USER – CHECKOUT
===================== */


/*export async function checkout({ user_id, cart, payment_method, note }) {
  if (!user_id || !cart || cart.length === 0) throw new Error("Giỏ hàng trống");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let paid = false;
  let status = "pending";

  // 1. Xử lý thanh toán thẻ
  if (payment_method === "meal_card") {
    await payByMealCard({ userId: user_id, amount: total });
    paid = true;
    status = "completed";
  }

  // 2. Tạo đơn hàng chính (Table: orders)
  const order = await orderDAL.createOrder({
    user_id,
    price: total,
    payment_method,
    paid,
    status,
    note,
  });

  // 3. Lưu chi tiết từng món (Table: orderDetails)
  // Duyệt qua cart để tạo record cho mỗi món
  const detailPromises = cart.map((item) =>
    orderDetailDAL.createOrderDetail({
      order_id: order.id,
      food_id: item.id, // Đảm bảo item.id là id của món ăn trong DB
      amount: item.qty,
      price: item.price, // Lưu giá tại thời điểm mua
    })
  );

  await Promise.all(detailPromises);

  return {
    order_id: order.id,
    paid,
    status,
    status_label: status === "completed" ? "Đã thanh toán" : "Chờ thanh toán",
  };
}*/

export async function checkout({ user_id, cart, payment_method, note }) {
  console.log("Checkout service started:", { user_id, cart, payment_method, note });
  
  try {
    // Validation
    if (!user_id) {
      throw new Error("Thiếu user_id");
    }
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      throw new Error("Giỏ hàng trống");
    }
    
    if (!payment_method || !["cash", "meal_card", "banking"].includes(payment_method)) {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }
    
    // Validate từng item
    cart.forEach((item, index) => {
      if (!item.id) throw new Error(`Món ${index + 1}: thiếu ID`);
      if (!item.price || item.price <= 0) throw new Error(`Món ${index + 1}: giá không hợp lệ`);
      if (!item.qty || item.qty <= 0) throw new Error(`Món ${index + 1}: số lượng không hợp lệ`);
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    let paid = false;
    let status = "pending";

    console.log("Calculated total:", total);

    // 1. Xử lý thanh toán thẻ
    if (payment_method === "meal_card") {
      console.log("Processing meal card payment...");
      try {
        await payByMealCard({ userId: user_id, amount: total });
        paid = true;
        status = "completed";
        console.log("Meal card payment successful");
      } catch (cardError) {
        console.error("Meal card payment failed:", cardError);
        throw new Error(`Thanh toán thẻ ăn thất bại: ${cardError.message}`);
      }
    }

    // 2. Tạo đơn hàng chính
    const order = await orderDAL.createOrder({
      user_id,
      price: total,
      payment_method,
      paid,
      status,
      note: note || null,
    });
    
    console.log("Order created with ID:", order.id);
    
    // 3. Lưu chi tiết từng món với giá thực tế (đã giảm nếu là combo)
    console.log("Creating order details...");
    
    for (const item of cart) {
      try {
        // Lưu price thực tế (đã giảm) từ cart item
        // item.price là giá đã giảm (nếu là combo)
        await orderDetailDAL.createOrderDetail({
          order_id: order.id,
          food_id: item.id,
          amount: item.qty,
          price: item.price, // LƯU GIÁ ĐÃ GIẢM
          original_price: item.originalPrice || item.price, // Lưu cả giá gốc
          is_combo_item: item.isComboItem || false, // Đánh dấu là combo
        });
      } catch (itemErr) {
        console.error("Error creating detail:", itemErr);
        throw itemErr;
      }
    }
    
    console.log("Checkout completed successfully!");
    
    return {
      order_id: order.id,
      paid,
      status,
      status_label: status === "completed" ? "Đã thanh toán" : "Chờ thanh toán",
    };
    
  } catch (err) {
    console.error("Checkout error:", err);
    throw err;
  }
}

export async function getUserPaymentStats(userId, range = "month") {
  if (!userId) throw new Error("Missing user_id");

  const orders = await orderDAL.getOrdersByUser(userId);

  const now = new Date();
  const filtered = orders.filter((o) => {
    const d = new Date(o.created_at);
    if (range === "week") return d >= new Date(now - 7 * 86400000);
    if (range === "month")
      return d >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  const total = filtered.reduce((s, o) => s + o.price, 0);

  const paid = filtered
    .filter((o) => o.paid)
    .reduce((s, o) => s + o.price, 0);

  const debt = filtered
    .filter((o) => !o.paid)
    .reduce((s, o) => s + o.price, 0);

  const mealCardDebt = filtered
    .filter((o) => o.payment_method === "meal_card" && !o.paid)
    .reduce((s, o) => s + o.price, 0);

  return {
    total_orders: filtered.length,
    total_amount: total,
    paid_amount: paid,
    debt_amount: debt,
    meal_card_debt: mealCardDebt,
  };
}

// Thêm hàm này vào order.user.service.js
export async function getUserOrderDetails(userId) {
  if (!userId) throw new Error("Missing user_id");

  // Lấy tất cả đơn hàng với chi tiết
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
        amount,
        price,
        food:food_id (
          id,
          name,
          image_url
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return orders || [];
}

/* =====================
   USER – HỦY ĐƠN HÀNG
===================== */
export async function cancelOrder(orderId, userId, reason = null) {
  if (!orderId) throw new Error("Thiếu orderId");
  if (!userId) throw new Error("Thiếu userId");

  // 1️⃣ Lấy đơn hàng
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, status, paid, payment_method")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Đơn hàng không tồn tại");
  }

  // 2️⃣ Kiểm tra quyền
  if (order.user_id !== userId) {
    throw new Error("Bạn không có quyền hủy đơn này");
  }

  // 3️⃣ Kiểm tra trạng thái
  if (order.status !== "pending") {
    throw new Error("Chỉ có thể hủy đơn đang chờ xử lý");
  }

  if (order.paid) {
    throw new Error("Đơn đã thanh toán, không thể hủy");
  }

  // 4️⃣ Cập nhật trạng thái
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      note: reason ? `Hủy đơn: ${reason}` : "Đơn hàng đã bị hủy",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    throw new Error("Không thể hủy đơn hàng");
  }

  return {
    success: true,
    message: "Hủy đơn hàng thành công",
    order_id: orderId,
  };
}


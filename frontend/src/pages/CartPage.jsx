import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PaymentModal from "../components/PaymentModal.jsx";
import OrderCard from "../components/OrderCard.jsx";
import React from "react";
import { toast } from "react-toastify";

export default function CartPage() {
  // CartPage.jsx (đầu file)
  const DEV_TIME_OFFSET_HOURS = -12; // quay ngược 12 tiếng

  const { cart, removeFromCart, updateQty, clearCart } = useCart();

  const [generalNote, setGeneralNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrderDate, setSelectedOrderDate] = useState("");
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Hàm mở modal xem chi tiết
  const openOrderDetails = async (orderId) => {
    console.log("Opening order details for order:", orderId);
    setSelectedOrder(orderId);
    setDetailsLoading(true);

    try {
      const apiUrl = `http://localhost:5000/api/orders/${orderId}/details`;
      console.log("Fetching from:", apiUrl);

      const response = await fetch(apiUrl);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      setOrderDetails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch order details error:", err);
      toast.error(`Không thể tải chi tiết: ${err.message}`);

      setOrderDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Hàm đóng modal
  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  // Load orders từ API
  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/user/${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        // Đảm bảo data là array
        const ordersArray = Array.isArray(data) ? data : [];
        setOrders(ordersArray);

        // Set ngày mặc định là hôm nay
        if (!selectedOrderDate) {
          setSelectedOrderDate(today);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError("Không thể tải đơn hàng");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [today, selectedOrderDate]);

  // Tính toán các giá trị
  const subtotal = useMemo(
    () => cart.reduce((t, i) => t + i.qty * i.price, 0),
    [cart]
  );

  // Tính tổng giá gốc (trước giảm giá)
  const originalSubtotal = useMemo(
    () => cart.reduce((t, i) => t + i.qty * (i.originalPrice || i.price), 0),
    [cart]
  );

  // Tính giảm giá combo (nếu có)
  const comboDiscount = useMemo(() => {
    // Kiểm tra xem có món nào trong combo không
    const hasComboItems = cart.some((item) => item.isComboItem);

    if (!hasComboItems) return 0;

    // Tính tổng giảm giá = tổng gốc - tổng đã giảm
    const totalDiscount = originalSubtotal - subtotal;
    return totalDiscount > 0 ? totalDiscount : 0;
  }, [cart, subtotal, originalSubtotal]);

  // Tổng cộng = tạm tính (đã trừ giảm giá combo)
  const total = subtotal;

  // Hàm checkout đã sửa
  const handleCheckout = async (payment_method) => {
    try {
      toast.loading("Đang xử lý thanh toán...");

      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast.dismiss();
        toast.warning("Vui lòng đăng nhập");
        return;
      }

      if (!payment_method) {
        toast.dismiss();
        toast.warning("Vui lòng chọn phương thức thanh toán");
        return;
      }

      if (cart.length === 0) {
        toast.dismiss();
        toast.info("Giỏ hàng đang trống");
        return;
      }
      // Gọi API checkout
      const res = await fetch(
        "http://localhost:5000/api/orders/user/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            cart: cart.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price, // Giá đã giảm (nếu là combo)
              originalPrice: item.originalPrice, // Giá gốc
              qty: item.qty,
              image: item.image,
              isComboItem: item.isComboItem || false,
            })),
            note: generalNote,
            payment_method,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      toast.dismiss();
      toast.success("Đặt hàng thành công!");

      setPaymentSuccess(true);

      // ✅ Cập nhật UI sau khi checkout thành công
      setOrderStatus(data.status || "pending");
      setLastOrder(data);

      // Reload danh sách đơn hàng
      const reloadUserId = localStorage.getItem("user_id");
      const ordersRes = await fetch(
        `http://localhost:5000/api/orders/user/${reloadUserId}`
      );
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Xóa giỏ hàng và reset form
      clearCart();
      setGeneralNote("");
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Lỗi khi thanh toán");
    }
  };

  // Lọc đơn hàng theo ngày
  const filteredOrders = useMemo(() => {
    if (!selectedOrderDate) return orders;

    return orders.filter((order) => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      return orderDate === selectedOrderDate;
    });
  }, [orders, selectedOrderDate]);

  // Set ngày mặc định là hôm nay
  useEffect(() => {
    setSelectedOrderDate(today);
  }, [today]);

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Hàm hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      const userId = localStorage.getItem("user_id");

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            reason: cancelReason || "Không có lý do",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Hủy đơn thất bại");
      }

      toast.success("Đã hủy đơn hàng thành công");

      // Refresh danh sách đơn hàng
      const ordersRes = await fetch(
        `http://localhost:5000/api/orders/user/${userId}`
      );
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Reset
      setCancellingOrder(null);
      setCancelReason("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Kiểm tra đơn hàng có thể hủy không
  const isOrderCancelable = (order) => {
    const allowedStatuses = ["pending", "preparing"];
    if (!allowedStatuses.includes(order.status)) return false;

    const createdAt = new Date(order.created_at);
    const now = new Date();
    const timeDiff = (now - createdAt) / (1000 * 60); // phút

    return timeDiff <= 10;
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT - GIỎ HÀNG HIỆN TẠI */}
        <div className="col-span-2 space-y-6">
          {/* Chỉ hiển thị giỏ hàng nếu có món */}
          {cart.length > 0 ? (
            <>
              <h2 className="font-semibold">Món đã chọn</h2>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex p-4 bg-white rounded-xl border shadow-sm"
                >
                  <img
                    src={item.image}
                    className="w-28 h-28 rounded-lg object-cover"
                    alt={item.name}
                  />

                  <div className="flex-1 ml-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        {/* Hiển thị badge combo */}
                        {item.isComboItem && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Combo -15%
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Hiển thị giá gốc và giá đã giảm */}
                    <div className="mt-1">
                      {item.isComboItem ? (
                        <>
                          <p className="line-through text-gray-400 text-sm">
                            {formatCurrency(item.originalPrice)}đ
                          </p>
                          <p className="text-orange-600 font-semibold">
                            {formatCurrency(item.price)}đ
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-600">
                          {formatCurrency(item.price)}đ
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.kcal} kcal
                    </p>

                    {/* Phần số lượng */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        className="p-1 border rounded-lg hover:bg-gray-100"
                        onClick={() =>
                          updateQty(item.id, Math.max(1, item.qty - 1))
                        }
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-1 border rounded-lg bg-gray-50 min-w-[40px] text-center">
                        {item.qty}
                      </span>
                      <button
                        className="p-1 border rounded-lg hover:bg-gray-100"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* General Note */}
              <div className="bg-white p-4 border rounded-xl shadow-sm">
                <p className="font-semibold">Ghi chú chung</p>
                <input
                  type="text"
                  className="mt-2 w-full border p-3 rounded-xl"
                  placeholder="Ví dụ: Không ớt, giao sát 12:00..."
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                />
              </div>
            </>
          ) : (
            // Giỏ hàng trống
            <div className="bg-white p-8 rounded-xl border shadow-sm text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500">
                Thêm món ăn từ menu để bắt đầu đặt hàng
              </p>
              <button
                onClick={() => (window.location.href = "/menu")}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Đến trang Menu
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — TÓM TẮT THANH TOÁN & ĐƠN HÀNG ĐÃ ĐẶT */}
        <div className="bg-white p-4 rounded-xl border shadow-sm h-fit">
          <h2 className="font-semibold mb-3">Tóm tắt thanh toán</h2>

          {cart.length > 0 ? (
            <>
              <div className="space-y-2 text-sm">
                {/* Tạm tính (giá gốc) */}
                <div className="flex justify-between">
                  <span>Tạm tính ({cart.length} món)</span>
                  <span>{formatCurrency(originalSubtotal)}đ</span>
                </div>

                {/* Giảm giá combo - chỉ hiện nếu có */}
                {comboDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Giảm giá combo</span>
                    <span>- {formatCurrency(comboDiscount)}đ</span>
                  </div>
                )}

                {/* Phí dịch vụ - có thể đổi tên thành "Ưu đãi" hoặc "Khuyến mãi" */}
                <div className="flex justify-between text-blue-600">
                  <span>Ưu đãi đặc biệt</span>
                  <span>0đ</span>
                </div>

                {/* Hoặc có thể để trống hoặc bỏ hoàn toàn */}
                {/* <div className="flex justify-between">
          <span>Khuyến mãi</span>
          <span>0đ</span>
        </div> */}
              </div>

              {/* Dòng kẻ ngang */}
              <div className="border-t my-3"></div>

              {/* Tổng cộng */}
              <div className="flex justify-between font-semibold text-lg">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(total)}đ</span>
              </div>

              {/* Hiển thị tổng tiết kiệm nếu có giảm giá */}
              {comboDiscount > 0 && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                  <div className="flex justify-between">
                    <span>Tiết kiệm được:</span>
                    <span className="font-semibold">
                      {formatCurrency(comboDiscount)}đ
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((comboDiscount / originalSubtotal) * 100)}% tổng
                    giá trị đơn hàng
                  </div>
                </div>
              )}

              {!orderStatus ? (
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl mt-3 hover:bg-orange-600"
                >
                  Thanh toán
                </button>
              ) : (
                <div
                  className={`w-full text-center py-3 rounded-xl mt-3 font-semibold ${
                    orderStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {orderStatus === "completed"
                    ? "Đã thanh toán"
                    : "Chờ thanh toán"}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>Chưa có món nào trong giỏ hàng</p>
            </div>
          )}

          {/* CÁC ĐƠN HÀNG ĐÃ ĐẶT */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Đơn hàng đã đặt</h2>

              {/* Bộ lọc ngày */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedOrderDate}
                  onChange={(e) => setSelectedOrderDate(e.target.value)}
                  className="border rounded-lg px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setSelectedOrderDate(today)}
                  className="px-2 py-1 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Hôm nay
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Đơn #{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Không có ngày"}{" "}
                          •
                          {order.created_at
                            ? new Date(order.created_at).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.paid || order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {order.paid || order.status === "completed"
                          ? "Đã thanh toán"
                          : "Chờ thanh toán"}
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương thức:</span>
                        <span>
                          {order.payment_method === "cash"
                            ? "Tiền mặt"
                            : order.payment_method === "meal_card"
                            ? "Thẻ ăn"
                            : order.payment_method || "Không xác định"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Tổng tiền:</span>
                        <span className="text-orange-600">
                          {formatCurrency(order.price || 0)}đ
                        </span>
                      </div>
                    </div>
                    {/* Nút xem chi tiết *
                    <button
                      onClick={async () => {
                        try {
                          // Fetch chi tiết đơn hàng
                          const res = await fetch(
                            `http://localhost:5000/api/orders/${order.id}/details`
                          );
                          if (!res.ok)
                            throw new Error("Không thể tải chi tiết");
                          const details = await res.json();

                          // Hiển thị chi tiết trong alert hoặc modal
                          const detailText = details
                            .map(
                              (item) =>
                                `${item.food_name || "Không tên"} × ${
                                  item.amount
                                }: ${formatCurrency(item.price * item.amount)}đ`
                            )
                            .join("\n");

                          alert(
                            `Chi tiết đơn #${
                              order.id
                            }:\n${detailText}\n\nTổng: ${formatCurrency(
                              order.price || 0
                            )}đ`
                          );
                        } catch (err) {
                          console.error("Fetch order details error:", err);
                          alert("Không thể tải chi tiết đơn hàng");
                        }
                      }}
                      className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Xem chi tiết →
                    </button>*/}

                    <button
                      onClick={() => openOrderDetails(order.id)}
                      className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Chưa có đơn hàng nào</p>
                {selectedOrderDate !== today && (
                  <button
                    onClick={() => setSelectedOrderDate(today)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Xem đơn hôm nay
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          originalSubtotal={originalSubtotal}
          comboDiscount={comboDiscount}
          total={total}
          note={generalNote}
          paymentSuccess={paymentSuccess}
          onClose={() => {
            setShowPayment(false);
            setPaymentSuccess(false); // reset khi đóng
          }}
          onConfirm={(method) => {
            //setShowPayment(false);
            handleCheckout(method);
          }}
        />
      )}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  Chi tiết đơn hàng #{selectedOrder}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  {/* Hiển thị trạng thái */}
                  {(() => {
                    const order = orders.find((o) => o.id === selectedOrder);
                    if (!order) return null;

                    let statusColor = "bg-yellow-100 text-yellow-800";
                    let statusText = "Chờ thanh toán";

                    if (order.status === "cancelled") {
                      statusColor = "bg-gray-100 text-gray-800";
                      statusText = "Đã hủy";
                    } else if (order.status === "paid" || order.paid) {
                      statusColor = "bg-green-100 text-green-800";
                      statusText = "Đã thanh toán";
                    }

                    return (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusColor}`}
                      >
                        {statusText}
                      </span>
                    );
                  })()}

                  <p className="text-sm text-gray-500">
                    {orders.find((o) => o.id === selectedOrder)?.created_at
                      ? new Date(
                          orders.find((o) => o.id === selectedOrder).created_at
                        ).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closeOrderDetails}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {detailsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-gray-500">Đang tải chi tiết...</p>
                </div>
              ) : orderDetails.length > 0 ? (
                <div className="space-y-4">
                  {orderDetails.map((item, index) => {
                    const isComboItem = item.is_combo_item;
                    const displayPrice = item.price;
                    const originalPrice = item.original_price;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={item.food_image || "/images/default-food.jpg"}
                            alt={item.food_name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {item.food_name}
                              </h3>
                              {isComboItem && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Combo -15%
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {item.food_description}
                            </p>
                            <div className="flex gap-4 mt-1 text-sm">
                              {isComboItem ? (
                                <>
                                  <span className="text-gray-600">
                                    <span className="line-through">
                                      {formatCurrency(originalPrice)}đ
                                    </span>
                                    {" → "}
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(displayPrice)}đ
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-600">
                                  Giá: {formatCurrency(displayPrice)}đ
                                </span>
                              )}
                              <span className="text-gray-600">
                                Số lượng: {item.amount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">
                            {formatCurrency(item.total)}đ
                          </p>
                          {isComboItem && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(originalPrice * item.amount)}đ
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tổng kết */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Tổng cộng</p>
                        <p className="text-sm text-gray-500">
                          {orderDetails.length} món
                          {orderDetails.some((item) => item.is_combo_item) && (
                            <span className="ml-2 text-green-600">
                              (Đã áp dụng combo)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        {orderDetails.some((item) => item.is_combo_item) && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatCurrency(
                              orderDetails.reduce(
                                (sum, item) =>
                                  sum + item.original_price * item.amount,
                                0
                              )
                            )}
                            đ
                          </p>
                        )}
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(
                            orderDetails.reduce(
                              (sum, item) => sum + item.total,
                              0
                            )
                          )}
                          đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="mt-2">Không tìm thấy chi tiết đơn hàng</p>
                </div>
              )}
            </div>

            {/* Thông tin thanh toán và nút hủy */}
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Phương thức thanh toán:
                  </p>
                  <p className="font-medium">
                    {orders.find((o) => o.id === selectedOrder)
                      ?.payment_method === "cash"
                      ? "Tiền mặt 💵"
                      : orders.find((o) => o.id === selectedOrder)
                          ?.payment_method === "meal_card"
                      ? "Thẻ ăn 💳"
                      : "Chưa xác định"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tổng tiền:</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      orders.find((o) => o.id === selectedOrder)?.price || 0
                    )}
                    đ
                  </p>
                </div>
              </div>

              {/* Nút hủy đơn hàng */}
              {(() => {
                const order = orders.find((o) => o.id === selectedOrder);
                if (!order) return null;

                // Nếu đã hủy hoặc đã thanh toán, không hiện nút hủy
                if (
                  order.status === "cancelled" ||
                  order.status === "paid" ||
                  order.paid
                ) {
                  return (
                    <button
                      onClick={closeOrderDetails}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                  );
                }

                // Kiểm tra thời gian hủy
                const canCancelOrder = () => {
                  if (!order.created_at) return false;

                  const orderDate = new Date(order.created_at);
                  const now = new Date();

                  // Tính thời gian cutoff: 24h00 của ngày hôm trước
                  const cutoffDate = new Date(orderDate);
                  cutoffDate.setDate(cutoffDate.getDate() - 1);
                  cutoffDate.setHours(24, 0, 0, 0);

                  return now < cutoffDate;
                };

                // Tính thời gian còn lại
                const getTimeRemaining = () => {
                  if (!order.created_at) return { hours: 0, minutes: 0 };

                  const orderDate = new Date(order.created_at);
                  const now = new Date();

                  const cutoffDate = new Date(orderDate);
                  cutoffDate.setDate(cutoffDate.getDate() - 1);
                  cutoffDate.setHours(24, 0, 0, 0);

                  const remainingTime = cutoffDate - now;
                  const hours = Math.floor(remainingTime / (1000 * 60 * 60));
                  const minutes = Math.floor(
                    (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
                  );

                  return {
                    hours: Math.max(0, hours),
                    minutes: Math.max(0, minutes),
                  };
                };

                const timeRemaining = getTimeRemaining();
                const canCancel = canCancelOrder();

                if (canCancel) {
                  return (
                    <>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm">
                            Bạn có thể hủy đơn hàng này trong vòng{" "}
                            <span className="font-bold">
                              {timeRemaining.hours} giờ {timeRemaining.minutes}{" "}
                              phút
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReason("");
                          }}
                          className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Hủy đơn hàng
                        </button>
                        <button
                          onClick={closeOrderDetails}
                          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Đóng
                        </button>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span className="text-sm">
                            Đơn hàng này không thể hủy (đã quá thời gian hủy
                            trước 24h00)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={closeOrderDetails}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Đóng
                      </button>
                    </>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận hủy đơn hàng - SỬA LẠI */}
      {/* Modal xác nhận hủy đơn hàng - THIẾT KẾ MỚI */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            {/* Header với icon cảnh báo */}
            <div className="relative bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b">
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-red-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">!</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center text-gray-800">
                Xác nhận hủy đơn hàng
              </h3>
              <p className="text-center text-gray-600 mt-2">
                Bạn sắp hủy đơn hàng #{cancellingOrder.id}
              </p>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="p-6">
              {/* Thông tin chi tiết */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="font-bold text-lg">#{cancellingOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày đặt</p>
                    <p className="font-medium">
                      {cancellingOrder.created_at
                        ? new Date(
                            cancellingOrder.created_at
                          ).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="font-bold text-green-600 text-lg">
                      {formatCurrency(cancellingOrder.price || 0)}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Chờ thanh toán
                    </span>
                  </div>
                </div>
              </div>

              {/* Lý do hủy */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Lý do hủy (tùy chọn)
                  </span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  rows="3"
                  placeholder="Vui lòng cho chúng tôi biết lý do bạn hủy đơn hàng này..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thông tin này sẽ giúp chúng tôi cải thiện dịch vụ tốt hơn
                </p>
              </div>

              {/* Thông tin quan trọng */}
              <div className="mb-6">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <svg
                    className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">
                      Thông tin quan trọng
                    </h4>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>
                          <span className="font-medium">Thời gian hủy:</span>{" "}
                          Trước 24h00 ngày hôm trước ngày đặt
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>
                          <span className="font-medium">Sau 24h00:</span> Đăng
                          ký có hiệu lực và sẽ được tính phí
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>
                          <span className="font-medium">
                            Chi phí hàng tháng:
                          </span>{" "}
                          Sẽ được thông báo vào cuối tháng
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>
                          <span className="font-medium">Hỗ trợ:</span> Tập đoàn
                          hỗ trợ 50% chi phí ăn trưa
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Thời gian còn lại */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Thời gian còn lại để hủy
                      </p>
                      {(() => {
                        if (!cancellingOrder.created_at) return null;

                        const orderDate = new Date(cancellingOrder.created_at);
                        const now = new Date();
                        const cutoffDate = new Date(orderDate);
                        cutoffDate.setDate(cutoffDate.getDate() - 1);
                        cutoffDate.setHours(24, 0, 0, 0);

                        const remainingTime = cutoffDate - now;
                        const hours = Math.floor(
                          remainingTime / (1000 * 60 * 60)
                        );
                        const minutes = Math.floor(
                          (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
                        );

                        if (remainingTime <= 0) {
                          return (
                            <p className="text-red-600 font-bold">
                              Đã quá thời gian hủy
                            </p>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold text-blue-600">
                                {hours}
                              </span>
                              <span className="text-sm text-blue-500">giờ</span>
                            </div>
                            <span className="text-blue-400">:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-2xl font-bold text-blue-600">
                                {minutes}
                              </span>
                              <span className="text-sm text-blue-500">
                                phút
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-500">Hạn cuối</p>
                    <p className="text-sm font-medium">
                      {(() => {
                        if (!cancellingOrder.created_at) return "N/A";
                        const orderDate = new Date(cancellingOrder.created_at);
                        const cutoffDate = new Date(orderDate);
                        cutoffDate.setDate(cutoffDate.getDate() - 1);
                        cutoffDate.setHours(24, 0, 0, 0);
                        return cutoffDate.toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer với nút hành động */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason("");
                  }}
                  className="flex-1 py-3.5 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Quay lại
                </button>

                <button
                  onClick={async () => {
                    try {
                      const userId = localStorage.getItem("user_id");
                      if (!userId) {
                        toast.error("Vui lòng đăng nhập");
                        return;
                      }

                      toast.info(
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang xử lý hủy đơn hàng...</span>
                        </div>,
                        { autoClose: false }
                      );

                      const response = await fetch(
                        `http://localhost:5000/api/orders/${cancellingOrder.id}/cancel`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            user_id: userId,
                            reason: cancelReason || "Khách hàng hủy",
                          }),
                        }
                      );

                      const result = await response.json();

                      toast.dismiss();

                      if (!response.ok) {
                        throw new Error(result.error || "Hủy đơn thất bại");
                      }

                      // Toast thành công đẹp hơn
                      toast.success(
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">
                              Hủy đơn hàng thành công!
                            </p>
                            <p className="text-sm text-green-700">
                              Đơn hàng #{cancellingOrder.id} đã được hủy
                            </p>
                          </div>
                        </div>,
                        { autoClose: 3000 }
                      );

                      // Cập nhật danh sách orders
                      setOrders((prevOrders) =>
                        prevOrders.map((order) =>
                          order.id === cancellingOrder.id
                            ? { ...order, status: "cancelled", paid: false }
                            : order
                        )
                      );

                      // Đóng cả hai modal
                      setCancellingOrder(null);
                      setCancelReason("");
                      closeOrderDetails();
                    } catch (err) {
                      toast.dismiss();
                      console.error("Cancel order error:", err);

                      // Toast lỗi đẹp hơn
                      toast.error(
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">
                              Không thể hủy đơn hàng
                            </p>
                            <p className="text-sm text-red-700">
                              {err.message}
                            </p>
                          </div>
                        </div>,
                        { autoClose: 4000 }
                      );
                    }
                  }}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Xác nhận hủy
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Bằng việc nhấn "Xác nhận hủy", bạn đồng ý với các điều khoản hủy
                đơn hàng
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

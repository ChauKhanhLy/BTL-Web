import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import PaymentModal from "../components/PaymentModal.jsx";
import OrderCard from "../components/OrderCard.jsx";
import React from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart();

  const [generalNote, setGeneralNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrderDate, setSelectedOrderDate] = useState("");
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
      alert(`Không thể tải chi tiết: ${err.message}`);
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
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      if (!payment_method) {
        alert("Vui lòng chọn phương thức thanh toán");
        return;
      }

      if (cart.length === 0) {
        alert("Giỏ hàng trống");
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

      alert("Đặt hàng thành công!");
      setShowPayment(false);
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.message || "Lỗi khi thanh toán");
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
          discount={discount}
          fee={fee}
          originalSubtotal={originalSubtotal}
          comboDiscount={comboDiscount}
          total={total}
          note={generalNote}
          onClose={() => setShowPayment(false)}
          onConfirm={(method) => {
            setShowPayment(false);
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
                <p className="text-sm text-gray-500">
                  {orders.find((o) => o.id === selectedOrder)?.created_at
                    ? new Date(
                        orders.find((o) => o.id === selectedOrder).created_at
                      ).toLocaleDateString("vi-VN")
                    : ""}
                </p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
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
                            src={
                              item.food_image ||
                              "https://via.placeholder.com/100"
                            }
                            alt={item.food_name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80x80?text=No+Image";
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
                              {/* Hiển thị giá đúng */}
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
                        {/* Hiển thị tổng tiền đã giảm nếu có combo */}
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

            {/* Footer */}
            <div className="p-4 border-t">
              <button
                onClick={closeOrderDetails}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

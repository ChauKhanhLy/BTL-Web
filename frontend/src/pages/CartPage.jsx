import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import PaymentModal from "../components/PaymentModal.jsx";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart } = useCart(); // ✅ DÙNG useCart()

  const [orderDetails, setOrderDetails] = useState([]);
  const orderId = 12;
  const [generalNote, setGeneralNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  //const [orders, setOrders] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch(`http://localhost:5000/api/orders/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const subtotal = cart.reduce((t, i) => t + i.qty * i.price, 0);
  const discount = 4000;
  const fee = 3000;
  const total = subtotal - discount + fee;
  const handleCheckout = async (payment_method) => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!payment_method) {
        alert("Vui lòng chọn phương thức thanh toán");
        return;
      }

      const res = await fetch(
        "http://localhost:5000/api/orders/user/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            cart,
            note: generalNote,
            payment_method, // ✅ lấy từ modal
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        return;
      }

      // ✅ CHỈ KHI BACKEND OK MỚI UPDATE UI
      setOrderStatus(data.status); // "pending" | "completed"
      setLastOrder(data.orderDetails);
      setShowPayment(false);

      clearCart();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thanh toán");
    }
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${orderId}/details`)
      .then((res) => res.json())
      .then((data) => {
        console.log("ORDER DETAILS:", data);
        setOrderDetails(data);
      })
      .catch((err) => {
        console.error("Fetch order details error:", err);
      });
  }, [orderId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-6">
          <h2 className="font-semibold">Món đã chọn</h2>

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex p-4 bg-white rounded-xl border shadow-sm"
            >
              <img
                src={item.image}
                className="w-28 h-28 rounded-lg object-cover"
              />

              <div className="flex-1 ml-4">
                <div className="flex justify-between">
                  <p className="font-semibold">{item.name}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {item.kcal} kcal • {item.price.toLocaleString()}đ
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    className="p-1 border rounded-lg"
                    onClick={() =>
                      updateQty(item.id, Math.max(1, item.qty - 1))
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <span className="px-4 py-1 border rounded-lg bg-gray-50">
                    {item.qty}
                  </span>

                  <button
                    className="p-1 border rounded-lg"
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
        </div>

        {/* RIGHT — PAYMENT */}
        <div className="bg-white p-4 rounded-xl border shadow-sm h-fit">
          <h2 className="font-semibold mb-3">Tóm tắt thanh toán</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </div>

            <div className="flex justify-between text-green-700">
              <span>Chiết khấu NLD</span>
              <span>- {discount.toLocaleString()}đ</span>
            </div>

            <div className="flex justify-between">
              <span>Phí phục vụ</span>
              <span>{fee.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="flex justify-between border-t mt-3 pt-3 font-semibold text-lg">
            <span>Tổng cộng:</span>
            <span>{total.toLocaleString()}đ</span>
          </div>

          {/* Hiển thị đơn vừa đặt */}
          {lastOrder && (
            <div className="mt-6 bg-white p-4 rounded-xl border shadow">
              <h3 className="font-semibold mb-3">Đơn hàng vừa tạo</h3>

              {lastOrder.orderDetails.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-2">
                  <span>
                    {item.food?.name} × {item.amount}
                  </span>
                  <span>{(item.price * item.amount).toLocaleString()}đ</span>
                </div>
              ))}

              {/* 🔽 CHI TIẾT ĐƠN HÀNG TỪ DB */}
              {orderDetails.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-xl border shadow">
                  <h3 className="font-semibold mb-3">Chi tiết đơn hàng (DB)</h3>

                  {orderDetails.map((item) => (
                    <div
                      key={item.food_id}
                      className="flex gap-4 border-b py-3"
                    >
                      <img
                        src={item.image_url}
                        alt={item.food_name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <p className="font-semibold">{item.food_name}</p>
                        <p className="text-sm text-gray-600">
                          Giá: {item.price.toLocaleString()}đ
                        </p>
                        <p className="text-sm">Số lượng: {item.amount}</p>
                        <p className="font-semibold text-orange-600">
                          Thành tiền:{" "}
                          {(item.price * item.amount).toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2">
                Trạng thái:{" "}
                <span className="text-green-600">Đã thanh toán</span>
              </div>
            </div>
          )}

          {!orderStatus ? (
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-orange-500 text-white py-3 rounded-xl mt-3"
            >
              Thanh toán
            </button>
          ) : (
            <div
              className={`w-full text-center py-3 rounded-xl mt-3 font-semibold
      ${
        orderStatus === "completed"
          ? "bg-green-100 text-green-700"
          : "bg-orange-100 text-orange-700"
      }
    `}
            >
              {orderStatus === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}
            </div>
          )}

          {/* Hiển thị các đơn hàng đã checkout */}
          {orders.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold">Đơn hàng đã đặt</h2>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-xl border shadow flex flex-col"
                >
                  {/* Header đơn */}
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-700">
                      Đơn hàng #{order.id}
                    </p>
                    <span
                      className={`font-semibold ${
                        order.status === "completed"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {order.status === "completed"
                        ? "Đã thanh toán"
                        : "Chờ thanh toán"}
                    </span>
                  </div>

                  {/* Danh sách món */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Món ăn</th>
                          <th className="p-2 text-center">Số lượng</th>
                          <th className="p-2 text-right">Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderDetails?.map((item) => (
                          <tr key={item.food_id} className="border-t">
                            <td className="p-2">
                              {item.food?.name || "Không tên"}
                            </td>
                            <td className="p-2 text-center">{item.amount}</td>
                            <td className="p-2 text-right">
                              {(item.price * item.amount).toLocaleString()}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tổng + ghi chú */}
                  <div className="flex justify-between items-center mt-3 border-t pt-2">
                    <p className="font-semibold">Tổng:</p>
                    <p className="font-bold text-lg">
                      {order.orderDetails
                        ?.reduce((sum, i) => sum + i.price * i.amount, 0)
                        .toLocaleString()}
                      đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showPayment && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          fee={fee}
          total={total}
          note={generalNote}
          onClose={() => setShowPayment(false)}
          onConfirm={(method) => {
            setShowPayment(false);
            handleCheckout(method);
          }}
        />
      )}
    </div>
  );
}

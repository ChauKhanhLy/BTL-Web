import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import PaymentModal from "../components/PaymentModal.jsx";

export default function CartPage() {
  const { cart, removeFromCart, updateQty } = useCart(); // ✅ DÙNG useCart()

  const [generalNote, setGeneralNote] = useState("");
  const [address, setAddress] = useState("");
  const [showPayment, setShowPayment] = useState(false);

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
            address,
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

      alert("Đặt món thành công!");
      setShowPayment(false);
      // TODO: clear cart
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thanh toán");
    }
  };

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

          {/* Delivery Info */}
          <div className="bg-white p-4 border rounded-xl shadow-sm">
            <p className="font-semibold">Thông tin giao nhận</p>
            <input
              type="text"
              className="mt-2 w-full border p-3 rounded-xl"
              placeholder="Nhà ăn Khu A • Bàn 12 • SĐT: 09xx xxx xxx"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-orange-500 text-white py-3 rounded-xl mt-3"
          >
            Thanh toán
          </button>
        </div>
      </div>
      {showPayment && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          fee={fee}
          total={total}
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

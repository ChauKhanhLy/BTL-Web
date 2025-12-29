import { useState } from "react";

export default function PaymentModal({
  cart,
  subtotal,
  discount,
  fee,
  total,
  onClose,
  onConfirm,
}) {
  const [method, setMethod] = useState("cash");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[420px] rounded-t-2xl md:rounded-2xl p-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Thanh toán</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* ORDER SUMMARY */}
        <div className="border rounded-xl p-3 mb-3">
          <p className="font-semibold mb-2">Món đã chọn</p>

          <div className="space-y-1 text-sm max-h-32 overflow-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>
                  {(item.qty * item.price).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className="border rounded-xl p-3 mb-3">
          <p className="font-semibold mb-2">Phương thức thanh toán</p>

          <div className="space-y-2">
            {[
              { key: "cash", label: "Tiền mặt tại quầy" },
              { key: "meal_card", label: "Thẻ ăn công ty" },
              { key: "bank", label: "Thẻ ngân hàng" },
              { key: "wallet", label: "Ví điện tử" },
            ].map(m => (
              <label
                key={m.key}
                className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer
                  ${method === m.key ? "border-orange-500 bg-orange-50" : ""}
                `}
              >
                <span>{m.label}</span>
                <input
                  type="radio"
                  checked={method === m.key}
                  onChange={() => setMethod(m.key)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* PRICE SUMMARY */}
        <div className="border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Chiết khấu</span>
            <span>-{discount.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Phí dịch vụ</span>
            <span>{fee.toLocaleString()}đ</span>
          </div>

          <div className="flex justify-between font-bold text-base mt-2">
            <span>Tổng thanh toán</span>
            <span className="text-orange-600">
              {total.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={() => onConfirm(method)}
          className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-semibold"
        >
          Xác nhận thanh toán
        </button>
      </div>
    </div>
  );
}

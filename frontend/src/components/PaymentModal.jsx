import { useState } from "react";
import { PAYMENT_METHODS } from "../constants";

export default function PaymentModal({
  cart,
  subtotal,
  discount,
  originalSubtotal,
  comboDiscount,
  fee,
  total,
  note,
  onClose,
  onConfirm,
}) {
  const [selectedMethod, setSelectedMethod] = useState("");

  const handleConfirm = () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }
    onConfirm(selectedMethod);
  };

  // Phương thức thanh toán - bạn có thể import từ constants nếu muốn
  const PAYMENT_OPTIONS = PAYMENT_METHODS;

  // Hiển thị label của phương thức đã chọn
  const getMethodLabel = () => {
    const method = PAYMENT_OPTIONS.find((m) => m.key === selectedMethod);
    return method ? method.label.replace(/[💰💳🏦]/g, "").trim() : "Chưa chọn";
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[420px] rounded-t-2xl md:rounded-2xl p-4 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3 sticky top-0 bg-white">
          <h2 className="font-bold text-lg">Thanh toán</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <div className="border rounded-xl p-3 mb-3">
          <p className="font-semibold mb-2">Món đã chọn</p>

          <div className="space-y-2 text-sm max-h-40 overflow-y-auto custom-scrollbar">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-1"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <div className="text-xs text-gray-500">
                    {item.qty} × {item.price.toLocaleString()}đ
                  </div>
                </div>
                <span className="font-semibold">
                  {(item.qty * item.price).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT METHOD - SELECT Ở ĐÂY */}
        <div className="border rounded-xl p-3 mb-3">
          <p className="font-semibold mb-2">Phương thức thanh toán *</p>

          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((m) => (
              <label
                key={m.key}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all
                  ${
                    selectedMethod === m.key
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
                onClick={() => setSelectedMethod(m.key)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center
                    ${
                      selectedMethod === m.key
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedMethod === m.key && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="font-medium">{m.label}</span>
                </div>

                {/* Ẩn input radio thực sự, chỉ dùng cho accessibility */}
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.key}
                  checked={selectedMethod === m.key}
                  onChange={() => {}}
                  className="sr-only"
                />
              </label>
            ))}
          </div>

          {/* Hiển thị cảnh báo nếu chưa chọn phương thức */}
          {!selectedMethod && (
            <p className="text-red-500 text-sm mt-2">
              Vui lòng chọn phương thức thanh toán
            </p>
          )}
        </div>

        {/* PRICE SUMMARY */}
        {/* PRICE SUMMARY - SỬA ĐOẠN NÀY */}
        <div className="border rounded-xl p-3 mb-3">
          <p className="font-semibold mb-2">Chi tiết thanh toán</p>

          <div className="space-y-2 text-sm">
            {/* DÒNG 1: TẠM TÍNH (giá gốc) */}
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính</span>
              <span>{originalSubtotal.toLocaleString()}đ</span>
            </div>

            {/* DÒNG 2: GIẢM GIÁ COMBO - chỉ hiện nếu có */}
            {comboDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-gray-600">Giảm giá combo</span>
                <span>-{comboDiscount.toLocaleString()}đ</span>
              </div>
            )}

            {/* DÒNG 3: ƯU ĐÃI ĐẶC BIỆT (thay cho Phí dịch vụ) */}
            <div className="flex justify-between text-blue-600">
              <span className="text-gray-600">Ưu đãi đặc biệt</span>
              <span>0đ</span>
            </div>

            {/* DÒNG KẺ NGANG */}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-base">
                <span>Tổng thanh toán</span>
                <span className="text-orange-600">
                  {total.toLocaleString()}đ
                </span>
              </div>

              {/* Hiển thị tiết kiệm nếu có giảm giá combo */}
              {comboDiscount > 0 && (
                <div className="text-xs text-green-600 mt-1 text-right">
                  Tiết kiệm: {comboDiscount.toLocaleString()}đ
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK SUMMARY */}
        <div className="border rounded-xl p-3 mb-4 text-sm">
          <p className="font-semibold mb-2">Tóm tắt đơn hàng</p>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Số món:</span>
              <span className="font-medium">{cart.length} món</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Phương thức:</span>
              <span className="font-medium">{getMethodLabel()}</span>
            </div>

            <div className="pt-2 border-t">
              <div className="text-gray-600 mb-1">Ghi chú:</div>
              <p className="text-gray-700 italic bg-gray-50 p-2 rounded">
                {note || "Không có ghi chú"}
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 sticky bottom-0 bg-white pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 border rounded-xl font-medium hover:bg-gray-50"
          >
            Hủy
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className={`w-full py-3 rounded-xl font-semibold transition-all
              ${
                selectedMethod
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {selectedMethod
              ? "Xác nhận thanh toán"
              : "Chọn phương thức thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}

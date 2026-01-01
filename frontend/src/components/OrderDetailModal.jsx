// components/OrderDetailModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function OrderDetailModal({ orderId, isOpen, onClose }) {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/details`);
        if (!res.ok) throw new Error("Failed to fetch details");
        const data = await res.json();
        setOrderDetails(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch order details error:", err);
        setOrderDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, isOpen]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const totalAmount = orderDetails.reduce((sum, item) => 
    sum + (item.price * item.amount), 0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng #{orderId}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-500">Đang tải chi tiết...</p>
            </div>
          ) : orderDetails.length > 0 ? (
            <div className="space-y-4">
              {orderDetails.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.food_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{item.food_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)}đ × {item.amount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">
                      {formatCurrency(item.price * item.amount)}đ
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Tổng kết */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-600">{formatCurrency(totalAmount)}đ</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy chi tiết đơn hàng
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
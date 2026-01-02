// components/OrderDetailModal.jsx
import { useState, useEffect } from "react";
import { X, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function OrderDetailModal({ orderId, isOpen, onClose, onOrderCancelled }) {
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Lấy cả thông tin order và chi tiết
        const [detailsRes, orderRes] = await Promise.all([
          fetch(`http://localhost:5000/api/orders/${orderId}/details`),
          fetch(`http://localhost:5000/api/orders/${orderId}`)
        ]);

        if (!detailsRes.ok || !orderRes.ok) {
          throw new Error("Failed to fetch order information");
        }

        const detailsData = await detailsRes.json();
        const orderData = await orderRes.json();

        setOrderDetails(Array.isArray(detailsData) ? detailsData : []);
        setOrderInfo(orderData);
      } catch (err) {
        console.error("Fetch order details error:", err);
        setOrderDetails([]);
        setOrderInfo(null);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, isOpen]);

  // Hàm hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!orderId || !orderInfo) return;

    setCancelling(true);
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          reason: cancelReason || "Khách hàng hủy",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Hủy đơn thất bại");
      }

      toast.success(result.message || "Đã hủy đơn hàng thành công");
      
      // Cập nhật thông tin order
      setOrderInfo({
        ...orderInfo,
        status: "cancelled",
        paid: false,
      });

      // Gọi callback để parent component biết
      if (onOrderCancelled) {
        onOrderCancelled(orderId);
      }

      // Đóng modal xác nhận hủy
      setShowCancelConfirm(false);
      setCancelReason("");
      
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Kiểm tra xem có thể hủy không
  const canCancelOrder = () => {
    if (!orderInfo) return false;
    
    // Chỉ hủy được khi đang chờ thanh toán
    if (orderInfo.status !== "pending_payment") return false;
    
    // Kiểm tra thời gian (30 phút)
    if (orderInfo.created_at) {
      const createdAt = new Date(orderInfo.created_at);
      const now = new Date();
      const timeDiff = (now - createdAt) / (1000 * 60); // phút
      
      return timeDiff <= 30;
    }
    
    return true; // Mặc định cho phép nếu không có thời gian
  };

  // Tính thời gian còn lại để hủy
  const getTimeRemaining = () => {
    if (!orderInfo?.created_at) return null;
    
    const createdAt = new Date(orderInfo.created_at);
    const now = new Date();
    const timeDiff = (now - createdAt) / (1000 * 60); // phút
    
    const remaining = 30 - timeDiff;
    return remaining > 0 ? Math.round(remaining) : 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const totalAmount = orderDetails.reduce(
    (sum, item) => sum + (item.price || 0) * (item.amount || 0),
    0
  );

  // Hàm hiển thị trạng thái
  const renderOrderStatus = (status) => {
    const statusConfig = {
      pending_payment: {
        label: "Chờ thanh toán",
        icon: <Clock className="w-4 h-4" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      paid: {
        label: "Đã thanh toán",
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      cancelled: {
        label: "Đã hủy",
        icon: <XCircle className="w-4 h-4" />,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      icon: <AlertCircle className="w-4 h-4" />,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Đơn hàng #{orderId}</h2>
            {orderInfo && (
              <div className="flex items-center gap-3 mt-1">
                {renderOrderStatus(orderInfo.status)}
                {orderInfo.payment_method && (
                  <span className="text-sm text-gray-500">
                    • {orderInfo.payment_method === "cash" ? "Tiền mặt" : "Thẻ ăn"}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-500">Đang tải chi tiết...</p>
            </div>
          ) : orderDetails.length > 0 ? (
            <div className="space-y-4">
              {orderDetails.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.food_name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                        }}
                      />
                    )}
                    <div>
                      <p className="font-semibold">{item.food_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)}đ × {item.amount}
                      </p>
                      {item.is_combo_item && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded mt-1 inline-block">
                          Combo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">
                      {formatCurrency(item.price * item.amount)}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy chi tiết đơn hàng
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span>{formatCurrency(totalAmount)}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí dịch vụ:</span>
              <span>0đ</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-orange-600">{formatCurrency(totalAmount)}đ</span>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          {orderInfo && (
            <div className="mt-4 text-sm text-gray-500">
              <p>
                Ngày đặt:{" "}
                {orderInfo.created_at
                  ? new Date(orderInfo.created_at).toLocaleString("vi-VN")
                  : "N/A"}
              </p>
              {orderInfo.note && (
                <p className="mt-1">
                  Ghi chú: <span className="text-gray-700">{orderInfo.note}</span>
                </p>
              )}
            </div>
          )}

          {/* Nút hủy đơn (nếu có thể) */}
          {orderInfo && canCancelOrder() && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      Có thể hủy trong{" "}
                      <span className="font-semibold text-green-600">
                        {getTimeRemaining()} phút
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                >
                  Hủy đơn hàng
                </button>
              </div>
            </div>
          )}

          {/* Thông báo không thể hủy */}
          {orderInfo && !canCancelOrder() && orderInfo.status === "pending_payment" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Đơn hàng này không thể hủy vì đã quá thời gian cho phép (30 phút)
                </span>
              </div>
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

      {/* Modal xác nhận hủy đơn */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="font-bold text-lg">Xác nhận hủy đơn hàng</h3>
            </div>

            <div className="p-4">
              <p className="mb-3">Bạn có chắc muốn hủy đơn hàng #{orderId}?</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do hủy (tùy chọn)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                  rows="3"
                  placeholder="Ví dụ: Thay đổi kế hoạch, đặt nhầm món..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                   Lưu ý quan trọng:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Chỉ có thể hủy đơn trong vòng 30 phút sau khi đặt</li>
                    <li>Đơn hàng phải ở trạng thái "Chờ thanh toán"</li>
                    <li>Nếu đã thanh toán bằng thẻ ăn, tiền sẽ được hoàn lại tự động</li>
                    <li>Sau khi hủy, không thể khôi phục đơn hàng</li>
                  </ul>
                </p>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason("");
                }}
                disabled={cancelling}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  "Xác nhận hủy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
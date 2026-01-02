// components/OrderCard.jsx
import React, { useState } from "react";

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Kiểm tra order có tồn tại không
  if (!order || !order.id) {
    return (
      <div className="bg-white border rounded-xl p-4 text-center text-gray-500">
        Đơn hàng không hợp lệ
      </div>
    );
  }
  
  // Tính tổng tiền với null checks
  const totalAmount = order.orderDetails?.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.amount || 0)),
    0
  ) || order.price || 0;
  
  // Định dạng ngày với null checks
  const orderDate = order.created_at 
    ? new Date(order.created_at).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Không có ngày";
  
  // Kiểm tra trạng thái
  const isCompleted = order.status === "completed" || order.paid === true;
  
  return (
    <div className="bg-white border-b hover:bg-gray-50 transition-colors">
      {/* Header - luôn hiển thị */}
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="font-semibold text-gray-800">Đơn hàng #{order.id || "N/A"}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isCompleted 
                ? "bg-green-100 text-green-800" 
                : "bg-orange-100 text-orange-800"
            }`}>
              {isCompleted ? "Đã thanh toán" : "Chờ thanh toán"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {orderDate}
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">Tổng:</span> {totalAmount.toLocaleString()}đ
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {expanded ? "Thu gọn" : "Xem chi tiết"}
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Chi tiết - hiển thị khi expanded */}
      {expanded && order.orderDetails && order.orderDetails.length > 0 && (
        <div className="px-4 pb-4 border-t pt-4">
          <div className="space-y-3">
            {order.orderDetails.map((item, idx) => {
              const itemPrice = item.price || 0;
              const itemAmount = item.amount || 0;
              const itemTotal = itemPrice * itemAmount;
              
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {item.food?.image_url && (
                        <img
                          src={item.food.image_url}
                          alt={item.food?.name || "Món ăn"}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.food?.name || "Không tên"}</p>
                        <p className="text-sm text-gray-600">
                          Giá: {itemPrice.toLocaleString()}đ × {itemAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {itemTotal.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Tóm tắt thanh toán */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                <p className="font-medium">
                  {order.payment_method === "cash" ? "Tiền mặt" : 
                   order.payment_method === "meal_card" ? "Thẻ ăn công ty" : 
                   order.payment_method || "Không xác định"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Thành tiền:</p>
                <p className="text-xl font-bold text-orange-600">
                  {totalAmount.toLocaleString()}đ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {expanded && (!order.orderDetails || order.orderDetails.length === 0) && (
        <div className="px-4 pb-4 border-t pt-4 text-center text-gray-500">
          Không có chi tiết đơn hàng
        </div>
      )}
    </div>
  );
};

export default OrderCard;
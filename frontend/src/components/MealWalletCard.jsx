// components/MealWalletCard.jsx
import React, { useState, useEffect } from "react";

export default function MealWalletCard({ userId, refreshTrigger }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchWalletData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/meal-wallet/details?user_id=${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setBalance(data.balance || 0);
      setTransactions(data.transactions || []);
      
    } catch (err) {
      console.error("Fetch wallet data error:", err);
      setError("Không thể tải thông tin thẻ ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [userId, refreshTrigger]);

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() + "đ" || "0đ";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Thẻ ăn của bạn</h3>
            <p className="text-sm opacity-90">Số dư hiện tại</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        
        {/* Balance */}
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
              <span>Đang tải...</span>
            </div>
          ) : error ? (
            <p className="text-center py-2 text-red-200">{error}</p>
          ) : (
            <p className="text-3xl font-bold text-center">
              {formatCurrency(balance)}
            </p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              // Mở modal nạp tiền
              alert("Chức năng nạp tiền đang phát triển!");
            }}
            className="py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 text-sm flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nạp tiền
          </button>
          <button
            onClick={() => {
              // Mở lịch sử giao dịch
              alert("Xem lịch sử giao dịch!");
            }}
            className="py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 text-sm flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Lịch sử
          </button>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="p-4">
        <h4 className="font-semibold mb-3 text-gray-700">Thống kê sử dụng</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Đã chi tiêu tháng này:</span>
            <span className="font-medium text-red-600">500,000đ</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Số lần sử dụng:</span>
            <span className="font-medium">12 lần</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Trung bình/lần:</span>
            <span className="font-medium">41,667đ</span>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dự kiến còn dùng được:</span>
              <span className="font-bold text-green-600">
                {balance && balance > 0 
                  ? Math.floor(balance / 41667) + " ngày" 
                  : "0 ngày"}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              (Tính theo mức chi tiêu trung bình)
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Transaction Preview */}
      {transactions.length > 0 && (
        <div className="p-4 border-t">
          <h4 className="font-semibold mb-2 text-gray-700">Giao dịch gần nhất</h4>
          <div className="space-y-2">
            {transactions.slice(0, 2).map((tx, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">{tx.note || "Thanh toán"}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span className={`font-bold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
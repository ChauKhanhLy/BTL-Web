import React, { useState, useEffect } from "react";
import { submitFeedback, getMyFeedbacks } from "../api/feedback.api.js";
import { getRecentOrders } from "../api/orders.api";

const quickTags = [
  "Quá mặn",
  "Quá nguội",
  "Ít khẩu phần",
  "Thiếu nêm nếm",
  "Đóng gói kém",
];

export default function FeedbackPage({ setCurrentPage }) {
  const user_id = 1; // tạm thời

  const [recentOrders, setRecentOrders] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDish, setSelectedDish] = useState("");
  const [impact, setImpact] = useState("Vừa");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    getRecentOrders(userId).then((res) => {
      const orders = res.data;
      setRecentOrders(orders);
      setSelectedOrder(orders[0]);
      setSelectedDish(orders[0]?.items?.[0]);
    });
  }, []);

  const loadOrders = async () => {
    const res = await getRecentOrders(user_id);
    setRecentOrders(res.data);
    setSelectedOrder(res.data[0]);
    setSelectedDish(res.data[0]?.items[0]);
  };

  const loadFeedbacks = async () => {
    const res = await getMyFeedbacks(user_id);
    setFeedbackHistory(res.data);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!description) {
      alert("Vui lòng nhập mô tả");
      return;
    }

    await submitFeedback({
      user_id,
      order_id: selectedOrder.id,
      food_id: selectedDish.id,
      impact,
      comment: description,
      tags: selectedTags,
      status: "submitted",
    });

    alert("Phản ánh đã được gửi!");
    setDescription("");
    setSelectedTags([]);
    loadFeedbacks();
  };

  const handleSaveDraft = async () => {
    await submitFeedback({
      order_id: selectedOrder.id,
      food_name: selectedDish,
      impact,
      description,
      tags: selectedTags,
      status: "draft",
    });

    alert("Đã lưu nháp");
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* ================= LEFT: FORM ================= */}
      <div className="col-span-2 bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Tạo phản ánh mới</h2>

        {/* Đơn gần đây */}
        <div className="mb-3">
          <label className="text-sm text-gray-500">Đơn gần đây</label>
          <input
            disabled
            value={
              selectedOrder
                ? `#${selectedOrder.id} • ${selectedOrder.created_at}`
                : ""
            }
            className="w-full border rounded-lg p-2 mt-1 bg-gray-50"
          />
        </div>

        {/* Món trong đơn */}
        <div className="mb-3">
          <label className="text-sm text-gray-500">Món trong đơn</label>
          <select
            className="w-full border rounded-lg p-2 mt-1"
            value={selectedDish}
            onChange={(e) => setSelectedDish(e.target.value)}
          >
            {selectedOrder?.items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Nhóm */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="text-sm text-gray-500">Nhóm vấn đề</label>
            <input
              disabled
              value="Chất lượng món"
              className="w-full border rounded-lg p-2 mt-1 bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Mức độ ảnh hưởng</label>
            <select
              className="w-full border rounded-lg p-2 mt-1"
              value={impact}
              onChange={(e) =>
                setSelectedDish(
                  selectedOrder.items.find(
                    (i) => i.id === Number(e.target.value)
                  )
                )
              }
            >
              <option>Nhẹ</option>
              <option>Vừa</option>
              <option>Nghiêm trọng</option>
            </select>
          </div>
        </div>

        {/* Mô tả */}
        <div className="mb-3">
          <label className="text-sm text-gray-500">Mô tả chi tiết</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Thịt hơi khô, cơm bị nguội..."
            className="w-full border rounded-lg p-3 mt-1"
          />
        </div>

        {/* Thẻ nhanh */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Thẻ nhanh (tối đa 3)</p>
          <div className="flex gap-2 flex-wrap">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full border text-sm
                  ${
                    selectedTags.includes(tag)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Lưu nháp
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-green-700 text-white"
          >
            Gửi phản ánh
          </button>
        </div>
      </div>

      {/* ================= RIGHT: SUMMARY ================= */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-bold text-lg mb-4">Tóm tắt phản hồi</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Đơn</span>
            <span>{selectedOrder?.orderId || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span>Món</span>
            <span>{selectedDish}</span>
          </div>
          <div className="flex justify-between">
            <span>Nhóm</span>
            <span>Chất lượng món</span>
          </div>
          <div className="flex justify-between">
            <span>Mức độ</span>
            <span>{impact}</span>
          </div>
        </div>

        <hr className="my-4" />

        <h4 className="font-semibold mb-2">Lịch sử gần đây</h4>

        <div className="space-y-2">
          {feedbackHistory.map((fb) => (
            <div
              key={fb.id}
              className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
            >
              <div>
                <p className="font-semibold">{fb.id}</p>
                <p className="text-gray-500">{fb.food_name}</p>
              </div>
              <span className="text-xs">{fb.status}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage("cart")}
          className="w-full mt-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Trở lại giỏ hàng
        </button>
      </div>
    </div>
  );
}

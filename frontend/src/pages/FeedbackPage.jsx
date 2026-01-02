import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Star, Save, Send, Clock, AlertCircle } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const quickTags = [
  "Quá mặn",
  "Quá nguội",
  "Ít khẩu phần",
  "Thiếu nêm nếm",
  "Đóng gói kém",
];

export default function FeedbackPage({ setCurrentPage }) {
  const user_id = localStorage.getItem("user_id");

  const [recentOrders, setRecentOrders] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [rating, setRating] = useState(0); // 0-5 sao
  const [hoverRating, setHoverRating] = useState(0);
  const [impact, setImpact] = useState("Vừa");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load dữ liệu khi component mount
  useEffect(() => {
    if (!user_id) {
      toast.error("Vui lòng đăng nhập!");
      setCurrentPage("login");
      return;
    }

    loadData();
    loadDrafts();
  }, []);

  // FeedbackPage.jsx - Sửa endpoint
  const loadData = async () => {
    try {
      setLoadingOrders(true);
      console.log("Loading REAL data for user:", user_id);

      // 1. Load recent orders - DÙNG ENDPOINT MỚI
      console.log("Calling API: /api/orders/user/recent");
      const ordersRes = await axios.get(`${API_URL}/orders/user/recent`, {
        params: { user_id },
      });

      console.log("Orders API response:", ordersRes.data);

      // Kiểm tra và set data
      if (ordersRes.data && Array.isArray(ordersRes.data)) {
        setRecentOrders(ordersRes.data);

        if (ordersRes.data.length > 0) {
          setSelectedOrder(ordersRes.data[0]);
          if (ordersRes.data[0]?.items && ordersRes.data[0].items.length > 0) {
            setSelectedDish(ordersRes.data[0].items[0]);
          }
          console.log("Set first order:", ordersRes.data[0]);
        } else {
          toast.info(
            "Bạn chưa có đơn hàng nào. Hãy đặt món trước khi gửi phản ánh!"
          );
        }
      }

      // 2. Load feedback history
      const feedbackRes = await axios.get(`${API_URL}/feedback/me`, {
        params: { user_id },
      });
      console.log("Feedback API response:", feedbackRes.data);
      setFeedbackHistory(feedbackRes.data || []);
    } catch (error) {
      console.error("Error loading REAL data:", error);
      console.error("Error response:", error.response?.data);

      toast.error(
        `Không thể tải dữ liệu: ${error.response?.data?.error || error.message}`
      );

      // Sử dụng dữ liệu mẫu để test UI
      const testOrders = [
        {
          id: 1,
          _id: "1",
          orderId: "#000001",
          created_at: "15/03/2024, 12:30",
          items: [
            { id: 1, name: "Cơm gà sốt tiêu đen" },
            { id: 2, name: "Canh rau củ" },
          ],
        },
        {
          id: 2,
          _id: "2",
          orderId: "#000002",
          created_at: "14/03/2024, 18:45",
          items: [{ id: 3, name: "Phở bò tái chín" }],
        },
      ];

      setRecentOrders(testOrders);
      if (testOrders.length > 0) {
        setSelectedOrder(testOrders[0]);
        setSelectedDish(testOrders[0].items[0]);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadDrafts = async () => {
    try {
      const response = await axios.get(`${API_URL}/feedback/me`, {
        params: {
          user_id,
          status: "draft",
        },
      });
      setDrafts(response.data || []);
    } catch (error) {
      console.error("Error loading drafts:", error);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      toast.success(`Đã bỏ chọn "${tag}"`);
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
      toast.success(`Đã chọn "${tag}"`);
    } else {
      toast.error("Chỉ được chọn tối đa 3 thẻ!");
    }
  };

  // FeedbackPage.jsx - Sửa hàm handleSubmit
  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả chi tiết!");
      return;
    }

    if (!selectedOrder || !selectedDish) {
      toast.error("Vui lòng chọn đơn hàng và món ăn!");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn đánh giá sao!");
      return;
    }

    try {
      setLoading(true);

      // DEBUG: Log chi tiết
      console.log("[FRONTEND] Preparing submit data...");
      console.log("Selected order:", selectedOrder);
      console.log(
        "Selected order id:",
        selectedOrder?.id,
        "type:",
        typeof selectedOrder?.id
      );
      console.log("Selected dish:", selectedDish);
      console.log(
        "Selected dish id:",
        selectedDish?.id,
        "type:",
        typeof selectedDish?.id
      );

      // QUAN TRỌNG: Đảm bảo đúng kiểu dữ liệu
      const orderId = selectedOrder?.id || selectedOrder?._id;
      const foodId = selectedDish?.id;

      console.log("Extracted IDs:", { orderId, foodId });

      // Chuyển đổi sang number
      const order_id = parseInt(orderId);
      const food_id = parseInt(foodId);

      console.log("Parsed numbers:", { order_id, food_id });

      if (isNaN(order_id) || isNaN(food_id)) {
        throw new Error(
          "ID không hợp lệ. Vui lòng chọn lại đơn hàng và món ăn."
        );
      }

      const title =
        selectedTags.length > 0
          ? `Phản ánh: ${selectedTags.join(", ")}`
          : `Đánh giá ${rating} sao - ${selectedDish.name}`;

      const feedbackData = {
        user_id: user_id,
        order_id: order_id, // Đã parse sang number
        food_id: food_id, // Đã parse sang number
        rating: parseInt(rating),
        comment: description,
        impact: impact,
        tags: selectedTags.join(", "),
        status: "submitted",
        title: title,
        type: "Chất lượng món",
        date: new Date().toISOString(),
      };

      console.log(
        "[FRONTEND] Submitting feedback:",
        JSON.stringify(feedbackData, null, 2)
      );
      console.log("Data types check:", {
        user_id: typeof feedbackData.user_id,
        order_id:
          typeof feedbackData.order_id +
          " (value: " +
          feedbackData.order_id +
          ")",
        food_id:
          typeof feedbackData.food_id +
          " (value: " +
          feedbackData.food_id +
          ")",
        rating: typeof feedbackData.rating,
      });

      const response = await axios.post(`${API_URL}/feedback`, feedbackData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("[FRONTEND] Feedback submitted:", response.data);
      toast.success("Phản ánh đã được gửi thành công! 🎉");

      // Reset form
      setDescription("");
      setSelectedTags([]);
      setRating(0);

      // Reload data
      const feedbackRes = await axios.get(`${API_URL}/feedback/me`, {
        params: { user_id },
      });
      setFeedbackHistory(feedbackRes.data || []);
      loadDrafts();
    } catch (err) {
      console.error("[FRONTEND] Error submitting feedback:", err);

      console.log("FULL RESPONSE:", err.response?.data);
      console.log("ERROR MESSAGE:", err.response?.data?.error);

      alert(err.response?.data?.error || "Submit feedback failed");
    } finally {
      setLoading(false);
    }
  };

  // Sửa hàm handleSaveDraft tương tự
  const handleSaveDraft = async () => {
    if (!selectedOrder || !selectedDish) {
      toast.error("Vui lòng chọn đơn hàng và món ăn!");
      return;
    }

    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả để lưu nháp!");
      return;
    }

    try {
      setLoading(true);

      const title =
        selectedTags.length > 0
          ? `[Nháp] ${selectedTags.join(", ")}`
          : `[Nháp] ${selectedDish.name} - ${rating || "Chưa đánh giá"} sao`;

      const feedbackData = {
        user_id: user_id,
        order_id: Number(selectedOrder.id), // Chuyển sang number
        food_id: Number(selectedDish.id), // Chuyển sang number
        rating: Number(rating) || 0,
        comment: description,
        impact: impact,
        tags: selectedTags.join(", "),
        status: "draft",
        title: title,
        type: "Chất lượng món",
        date: new Date().toISOString(),
      };

      console.log("💾 Saving draft:", feedbackData);

      const response = await axios.post(`${API_URL}/feedback`, feedbackData);
      console.log("Draft saved:", response.data);

      toast.success("Đã lưu nháp thành công! 💾");

      // Load lại drafts
      loadDrafts();
    } catch (error) {
      console.error("Error saving draft:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        `Lưu nháp thất bại: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };
  const loadDraft = (draft) => {
    setSelectedOrder(
      recentOrders.find((order) => order.id === draft.order_id) || null
    );
    setSelectedDish({
      id: draft.food_id,
      name: draft.food?.name || "Món không xác định",
    });
    setRating(draft.rating || 0);
    setImpact(draft.impact || "Vừa");
    setDescription(draft.comment || "");
    setSelectedTags(draft.tags ? draft.tags.split(", ").filter((t) => t) : []);

    toast.success("Đã tải nháp!");
  };

  const deleteDraft = async (draftId) => {
    try {
      await axios.delete(`${API_URL}/feedback/${draftId}`);
      setDrafts(drafts.filter((d) => d.id !== draftId));
      toast.success("Đã xóa nháp!");
    } catch (error) {
      toast.error("Xóa nháp thất bại!");
    }
  };

  // Format status để hiển thị
  const getStatusText = (status) => {
    switch (status) {
      case "submitted":
        return "Đã gửi";
      case "draft":
        return "Nháp";
      case "resolved":
        return "Đã giải quyết";
      default:
        return status || "Đang xử lý";
    }
  };

  // Star rating component
  const StarRating = () => (
    <div className="flex items-center mb-4">
      <span className="text-sm font-medium text-gray-700 mr-3">Đánh giá:</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 ? `${rating} sao` : "Chưa đánh giá"}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      {/* ================= LEFT: DRAFTS ================= */}
      <div className="col-span-1 bg-white rounded-xl p-4 shadow">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <Save className="w-5 h-5 mr-2 text-blue-600" />
          Nháp đã lưu
        </h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Chưa có nháp nào</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm truncate">
                      {draft.title || "Nháp không tiêu đề"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(draft.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDraft(draft.id);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                </div>

                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <span className="truncate">
                    {draft.food?.name || "Món không xác định"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => loadDraft(draft)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Tiếp tục
                  </button>
                  <div className="flex items-center">
                    {draft.rating > 0 && (
                      <span className="flex items-center text-xs">
                        {draft.rating}{" "}
                        <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= CENTER: FORM ================= */}
      <div className="col-span-2 bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <AlertCircle className="w-6 h-6 mr-2 text-green-600" />
          Tạo phản ánh mới
        </h2>

        {loadingOrders ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        ) : (
          <>
            {/* Đơn gần đây */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn gần đây
              </label>

              <select
                className="w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedOrder?._id || selectedOrder?.id || ""}
                onChange={(e) => {
                  const orderId = e.target.value;
                  if (!orderId) {
                    setSelectedOrder(null);
                    setSelectedDish(null);
                    return;
                  }
                  // Tìm order bằng cả _id (string) và id
                  const order = recentOrders.find(
                    (o) =>
                      o._id === orderId ||
                      o.id.toString() === orderId ||
                      o.id === orderId
                  );
                  console.log("Selected order:", order);
                  setSelectedOrder(order);
                  if (order?.items && order.items.length > 0) {
                    setSelectedDish(order.items[0]);
                  } else {
                    setSelectedDish(null);
                  }
                }}
                disabled={loading}
              >
                <option value="">Chọn đơn hàng...</option>
                {recentOrders.map((order) => (
                  <option
                    key={order._id || order.id}
                    value={order._id || order.id}
                  >
                    {order.orderId} • {order.created_at || order.time}
                  </option>
                ))}
              </select>
              {recentOrders.length === 0 && !loadingOrders && (
                <p className="text-sm text-gray-500 mt-1">
                  Không có đơn hàng gần đây
                </p>
              )}
            </div>

            {/* Món trong đơn */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Món trong đơn
              </label>
              <select
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedDish?.id || ""}
                onChange={(e) => {
                  if (!selectedOrder) return;
                  const dishId = e.target.value;
                  const dish = selectedOrder.items.find(
                    (i) => i.id.toString() === dishId || i.id === dishId
                  );
                  setSelectedDish(dish);
                }}
                disabled={!selectedOrder || loading}
              >
                <option value="">Chọn món ăn...</option>
                {selectedOrder?.items?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <StarRating />

            {/* Nhóm và Mức độ */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm vấn đề
                </label>
                <input
                  type="text"
                  readOnly
                  value="Chất lượng món"
                  className="w-full border rounded-lg p-3 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức độ ảnh hưởng
                </label>
                <select
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  disabled={loading}
                >
                  <option value="Nhẹ">Nhẹ</option>
                  <option value="Vừa">Vừa</option>
                  <option value="Nghiêm trọng">Nghiêm trọng</option>
                </select>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Thịt hơi khô, cơm bị nguội..."
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              />
            </div>

            {/* Thẻ nhanh */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thẻ nhanh (tối đa 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Đã chọn: {selectedTags.join(", ")}
                </p>
              )}
            </div>

            {/* Nút hành động */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handleSaveDraft}
                disabled={loading || !description.trim()}
                className="flex items-center px-6 py-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0 || !description.trim()}
                className="flex items-center px-8 py-3 rounded-lg bg-green-700 hover:bg-green-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Đang xử lý..." : "Gửi phản ánh"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ================= RIGHT: SUMMARY ================= */}
      <div className="col-span-1 bg-white rounded-xl p-6 shadow">
        <h3 className="font-bold text-lg mb-4">Tóm tắt phản hồi</h3>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Đơn:</span>
            <span className="font-medium">
              {selectedOrder?.orderId || "Chưa chọn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Món:</span>
            <span className="font-medium">
              {selectedDish?.name || "Chưa chọn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Đánh giá:</span>
            <span className="font-medium flex items-center">
              {rating > 0 ? (
                <>
                  {rating}
                  <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
                </>
              ) : (
                "Chưa đánh giá"
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nhóm:</span>
            <span className="font-medium">Chất lượng món</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mức độ:</span>
            <span
              className={`font-medium ${
                impact === "Nghiêm trọng"
                  ? "text-red-600"
                  : impact === "Vừa"
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {impact}
            </span>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Thẻ:</span>
              <span className="font-medium text-green-600 text-right">
                {selectedTags.join(", ")}
              </span>
            </div>
          )}
        </div>

        <hr className="my-4" />

        <h4 className="font-semibold mb-3">Lịch sử gần đây</h4>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {feedbackHistory.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Chưa có phản ánh nào</p>
          ) : (
            feedbackHistory.slice(0, 5).map((fb) => (
              <div
                key={fb.id}
                className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">
                      {fb.food?.name || "Món không xác định"}
                    </p>
                    <div className="flex items-center mt-1">
                      {fb.rating > 0 && (
                        <div className="flex items-center mr-2">
                          {[...Array(fb.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      fb.status === "submitted"
                        ? "bg-green-100 text-green-800"
                        : fb.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : fb.status === "resolved"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusText(fb.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {fb.comment || "Không có mô tả"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(fb.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => setCurrentPage("cart")}
          className="w-full mt-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
        >
          Trở lại giỏ hàng
        </button>
      </div>
    </div>
  );
}

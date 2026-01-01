import React, { useState, useEffect, useCallback } from "react";
import { useMemo } from "react";
import { DATE_FILTERS } from "../constants/filters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function StatsPage({ searchKeyword }) {
  const today = new Date().toISOString().slice(0, 10);
  const [filter, setFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(today);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedStatsFilter, setSelectedStatsFilter] = useState("all");
  // Thêm state mới
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Thêm các state mới
  const [chartData, setChartData] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState({
    chart: true,
    foods: true,
    payment: true,
    orders: true,
  });
  const [errors, setErrors] = useState({
    chart: null,
    foods: null,
    payment: null,
    orders: null,
  });

  // Lấy user_id
  const userId = localStorage.getItem("user_id");

  // Thêm hàm xử lý
  // Home.jsx - sửa hàm handleViewDetailedReport
  // Sửa hàm handleViewDetailedReport
  const handleViewDetailedReport = () => {
    console.log("Generating report for filter:", filter);

    // Sử dụng filteredOrders cho báo cáo
    const report = {
      generatedAt: new Date().toLocaleString("vi-VN"),
      period: DATE_FILTERS.find((f) => f.key === filter)?.label || filter,
      filter: filter,
      userStats: statsOverview, // Đã tính từ filteredOrders
      filteredOrdersCount: filteredOrders.length,
      orderCountByMonth: chartData.filter((item) => {
        // Lọc chart data theo filter nếu cần
        if (filter === "month") {
          const itemDate = new Date(item.time + "-01");
          const now = new Date();
          return itemDate.getMonth() === now.getMonth();
        }
        if (filter === "year") {
          const itemYear = item.time.split("-")[0];
          return itemYear === new Date().getFullYear().toString();
        }
        return true;
      }),
      topFoods: topFoods, // API đã filter
      paymentDistribution: paymentChartData, // API đã filter
      recentOrders: filteredOrders.slice(0, 10),
    };

    console.log("Report data:", report);
    setReportData(report);
    setShowReportModal(true);
  };

  // Thêm hàm tính toán stats cho filtered orders
  const calculateFilteredStats = (filteredOrders, currentFilter) => {
    const totalOrders = filteredOrders.length;
    const totalSpent = filteredOrders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    );
    // Sửa phần tính toán trong statsOverview
    const paidTotal = filteredOrders.reduce((sum, o) => {
      const isPaid =
        o.status === "Đã thanh toán" ||
        o.paid === true ||
        o.paid === "true" ||
        (typeof o.paid === "string" && o.paid.toLowerCase() === "true");

      return isPaid ? sum + (o.total || 0) : sum;
    }, 0);

    const unpaidTotal = filteredOrders.reduce((sum, o) => {
      const isUnpaid =
        o.status === "Chưa thanh toán" ||
        o.paid === false ||
        o.paid === "false" ||
        (typeof o.paid === "string" && o.paid.toLowerCase() === "false");

      return isUnpaid ? sum + (o.total || 0) : sum;
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const cashOrders = filteredOrders.filter(
      (o) => o.paymentMethod === "cash" || o.payment_method === "cash"
    ).length;

    const cardOrders = filteredOrders.filter(
      (o) => o.paymentMethod === "meal_card" || o.payment_method === "meal_card"
    ).length;

    const cashTotal = filteredOrders.reduce((sum, o) => {
      const isCash = o.paymentMethod === "cash" || o.payment_method === "cash";
      return isCash ? sum + (o.total || 0) : sum;
    }, 0);

    const cardTotal = filteredOrders.reduce((sum, o) => {
      const isCard =
        o.paymentMethod === "meal_card" || o.payment_method === "meal_card";
      return isCard ? sum + (o.total || 0) : sum;
    }, 0);

    return {
      totalOrders,
      totalSpent,
      paidTotal,
      unpaidTotal,
      avgOrderValue,
      cashOrders,
      cardOrders,
      cashTotal,
      cardTotal,
    };
  };

  // Home.jsx - sửa các useEffect để truyền filter

  // 1. Lấy dữ liệu biểu đồ chi phí (đã có filter)
  useEffect(() => {
    if (!userId) return;

    fetch(
      `http://localhost:5000/api/stats/chart?user_id=${userId}&filter=${filter}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        setChartData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Fetch chart error:", err);
        setErrors((prev) => ({ ...prev, chart: err.message }));
        setChartData([]);
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, chart: false }));
      });
  }, [userId, filter]); // Thêm filter dependency

  // 2. Lấy top món ăn với filter
  useEffect(() => {
    if (!userId) return;

    fetch(
      `http://localhost:5000/api/stats/top-foods?user_id=${userId}&limit=5&filter=${filter}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        setTopFoods(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Fetch top foods error:", err);
        setErrors((prev) => ({ ...prev, foods: err.message }));
        setTopFoods([]);
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, foods: false }));
      });
  }, [userId, filter]); // Thêm filter dependency

  // 3. Lấy thống kê phương thức thanh toán với filter
  useEffect(() => {
    if (!userId) return;

    fetch(
      `http://localhost:5000/api/stats/payment-stats?user_id=${userId}&filter=${filter}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        setPaymentStats(data);
      })
      .catch((err) => {
        console.error("Fetch payment stats error:", err);
        setErrors((prev) => ({ ...prev, payment: err.message }));
        setPaymentStats(null);
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, payment: false }));
      });
  }, [userId, filter]); // Thêm filter dependency

  // 4. Lấy chi tiết đơn hàng
  // Home.jsx - sửa useEffect lấy order details
  useEffect(() => {
    if (!userId) {
      setErrors((prev) => ({ ...prev, orders: "Chưa đăng nhập" }));
      setLoading((prev) => ({ ...prev, orders: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, orders: true }));
    setErrors((prev) => ({ ...prev, orders: null }));

    console.log("Fetching order details for user:", userId);

    fetch(`http://localhost:5000/api/orders/user/${userId}/details`)
      .then(async (res) => {
        console.log("Order details response status:", res.status);

        if (!res.ok) {
          // Nếu API lỗi, thử dùng fallback data
          console.warn("API failed, using fallback data");
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("Order details API response:", data);
        return data;
      })
      .then((data) => {
        // Kiểm tra data có phải là array không
        if (!Array.isArray(data)) {
          console.warn("API không trả về array, using empty array");
          setOrderDetails([]);
          return;
        }

        // Format data
        const formattedData = data.map((order) => {
          console.log("Processing order:", order);

          return {
            id: order.id,
            created_at: order.created_at,
            date: order.created_at
              ? new Date(order.created_at).toLocaleDateString("vi-VN")
              : "Không có ngày",
            time: order.created_at
              ? new Date(order.created_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            items:
              order.orderDetails?.map((item) => ({
                name: item.food_name || "Không tên",
                quantity: item.amount || 0,
                price: item.price || 0,
                total: (item.amount || 0) * (item.price || 0),
                image_url: item.image_url,
              })) || [],
            total: order.total || 0,
            paymentMethod: order.payment_method || "cash",
            payment_method: order.payment_method || "cash", // Giữ cả 2
            status:
              order.status ||
              (order.paid ? "Đã thanh toán" : "Chưa thanh toán"),
            paid: order.paid || false,
            note: order.note || "",
          };
        });

        console.log("Formatted order details:", formattedData);
        setOrderDetails(formattedData);
      })
      .catch((err) => {
        console.error("Fetch order details error:", err);

        // Dùng fallback data nếu API fail
        const fallbackData = [
          {
            id: 1,
            created_at: new Date().toISOString(),
            date: new Date().toLocaleDateString("vi-VN"),
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            items: [
              {
                name: "Cơm gà",
                quantity: 1,
                price: 40000,
                total: 40000,
                image_url: "",
              },
              {
                name: "Nước cam",
                quantity: 1,
                price: 40000,
                total: 40000,
                image_url: "",
              },
            ],
            total: 80000,
            paymentMethod: "meal_card",
            payment_method: "meal_card",
            status: "Đã thanh toán",
            paid: true,
            note: "",
          },
          {
            id: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            date: new Date(Date.now() - 86400000).toLocaleDateString("vi-VN"),
            time: new Date(Date.now() - 86400000).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            items: [
              {
                name: "Phở bò",
                quantity: 2,
                price: 60000,
                total: 120000,
                image_url: "",
              },
            ],
            total: 120000,
            paymentMethod: "cash",
            payment_method: "cash",
            status: "Chưa thanh toán",
            paid: false,
            note: "Không hành",
          },
        ];

        console.log("Using fallback data:", fallbackData);
        setOrderDetails(fallbackData);
        setErrors((prev) => ({ ...prev, orders: "Đang dùng dữ liệu mẫu" }));
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, orders: false }));
      });
  }, [userId]);
  // Sửa hàm filterOrderByDate trong Home.jsx
  // Home.jsx - SỬA LẠI HOÀN TOÀN HÀM NÀY
  const filterOrderByDate = useCallback(
    (order, filterType, selectedDateParam = selectedDate) => {
      if (!order.created_at) return false;

      const orderDate = new Date(order.created_at);
      const now = new Date();

      // Nếu có selectedDateParam (ngày cụ thể)
      if (selectedDateParam && selectedDateParam !== today) {
        const selected = new Date(selectedDateParam);
        return orderDate.toDateString() === selected.toDateString();
      }

      // Nếu dùng filter thời gian
      switch (filterType) {
        case "today": {
          return orderDate.toDateString() === now.toDateString();
        }
        case "week": {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return orderDate >= weekAgo;
        }
        case "month": {
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        }
        case "year": {
          return orderDate.getFullYear() === now.getFullYear();
        }
        case "all":
        default: {
          return true;
        }
      }
    },
    [selectedDate, today]
  );
  // Tính toán filteredOrders cho các mục đích sử dụng
  const filteredOrders = useMemo(() => {
    return orderDetails.filter((order) =>
      filterOrderByDate(order, filter, selectedDate)
    );
  }, [orderDetails, filter, selectedDate, filterOrderByDate]);

  // Tính toán tổng quan
  /* Home.jsx - sửa phần tính toán statsOverview
  const statsOverview = useMemo(() => {
    console.log("Order details for stats:", orderDetails);
    console.log("Current filter:", filter);
    console.log("Selected date:", selectedDate);

    // Lọc orderDetails theo filter
    // Sửa filteredOrders calculation
    const filteredOrders = useMemo(() => {
      console.log(`🔍 Recalculating filteredOrders for filter: ${filter}`);
      console.log(`   Total orders: ${orderDetails.length}`);

      const result = orderDetails.filter((order) =>
        filterOrderByDate(order, filter)
      );

      console.log(`   Filtered orders count: ${result.length}`);

      // Log chi tiết từng order đã filter
      result.forEach((order, index) => {
        console.log(
          `   ${index + 1}. Order ${order.id}: ${
            order.created_at
              ? new Date(order.created_at).toLocaleDateString()
              : "no date"
          } - ${order.payment_method} - ${order.total}đ`
        );
      });

      return result;
    }, [orderDetails, filter, filterOrderByDate]);

    console.log("Filtered orders count:", filteredOrders.length);

    const totalOrders = filteredOrders.length;

    // Tính tổng chi tiêu
    const totalSpent = filteredOrders.reduce((sum, o) => {
      return sum + (o.total || 0);
    }, 0);

    // Tính đã thanh toán
    // Sửa phần tính toán trong statsOverview
    const paidTotal = filteredOrders.reduce((sum, o) => {
      // Debug từng order
      const isPaid =
        o.status === "Đã thanh toán" ||
        o.paid === true ||
        o.paid === "true" ||
        (typeof o.paid === "string" && o.paid.toLowerCase() === "true");

      if (isPaid) {
        console.log(`Order ${o.id} is PAID:`, {
          status: o.status,
          paid: o.paid,
          total: o.total,
        });
        return sum + (o.total || 0);
      }
      return sum;
    }, 0);

    const unpaidTotal = filteredOrders.reduce((sum, o) => {
      const isUnpaid =
        o.status === "Chưa thanh toán" ||
        o.paid === false ||
        o.paid === "false" ||
        (typeof o.paid === "string" && o.paid.toLowerCase() === "false");

      if (isUnpaid) {
        console.log(`Order ${o.id} is UNPAID:`, {
          status: o.status,
          paid: o.paid,
          total: o.total,
        });
        return sum + (o.total || 0);
      }
      return sum;
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Tính thống kê phương thức thanh toán
    const cashOrders = filteredOrders.filter(
      (o) => o.paymentMethod === "cash" || o.payment_method === "cash"
    ).length;

    const cardOrders = filteredOrders.filter(
      (o) => o.paymentMethod === "meal_card" || o.payment_method === "meal_card"
    ).length;

    const cashTotal = filteredOrders.reduce((sum, o) => {
      const isCash = o.paymentMethod === "cash" || o.payment_method === "cash";
      return isCash ? sum + (o.total || 0) : sum;
    }, 0);

    const cardTotal = filteredOrders.reduce((sum, o) => {
      const isCard =
        o.paymentMethod === "meal_card" || o.payment_method === "meal_card";
      return isCard ? sum + (o.total || 0) : sum;
    }, 0);

    console.log("Stats calculated for filter", filter, ":", {
      totalOrders,
      totalSpent,
      paidTotal,
      unpaidTotal,
      cashTotal,
      cardTotal,
      cashOrders,
      cardOrders,
    });

    return {
      totalOrders,
      totalSpent,
      paidTotal,
      unpaidTotal,
      avgOrderValue,
      cashOrders,
      cardOrders,
      cashTotal,
      cardTotal,
    };
  }, [orderDetails, filter, selectedDate]); // Thêm filter và selectedDate vào dependencies
*/

const statsOverview = useMemo(() => {
  return calculateFilteredStats(filteredOrders, filter);
}, [filteredOrders, filter]);

  // THAY THẾ HOÀN TOÀN statsOverview bằng:
  
  // Dữ liệu cho biểu đồ phương thức thanh toán
  const paymentChartData = useMemo(() => {
    if (!paymentStats) return [];

    return [
      { name: "Tiền mặt", value: paymentStats.cash?.total || 0 },
      { name: "Thẻ ăn", value: paymentStats.meal_card?.total || 0 },
      { name: "Chuyển khoản", value: paymentStats.banking?.total || 0 },
    ].filter((item) => item.value > 0);
  }, [paymentStats]);

  // Màu cho biểu đồ
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Lọc order details theo trạng thái
  const filteredOrderDetails = useMemo(() => {
    if (selectedStatsFilter === "all") return orderDetails;
    if (selectedStatsFilter === "paid")
      return orderDetails.filter((o) => o.status === "Đã thanh toán");
    if (selectedStatsFilter === "unpaid")
      return orderDetails.filter((o) => o.status === "Chưa thanh toán");
    return orderDetails;
  }, [orderDetails, selectedStatsFilter]);

  // Component hiển thị loading
  const LoadingSpinner = ({ text = "Đang tải..." }) => (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-3"></div>
      <p className="text-gray-500">{text}</p>
    </div>
  );

  // Component hiển thị lỗi
  const ErrorMessage = ({ error, onRetry }) => (
    <div className="flex flex-col items-center justify-center p-8 text-red-500">
      <svg
        className="w-12 h-12 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="font-semibold mb-2">Lỗi khi tải dữ liệu</p>
      <p className="text-sm mb-4 text-center">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Thử lại
        </button>
      )}
    </div>
  );

  // Thêm hàm helper
  const getFilterDateRange = (filterType) => {
    const now = new Date();
    switch (filterType) {
      case "today":
        return now.toLocaleDateString("vi-VN");
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return `${weekAgo.toLocaleDateString(
          "vi-VN"
        )} - ${now.toLocaleDateString("vi-VN")}`;
      case "month":
        return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
      case "year":
        return `Năm ${now.getFullYear()}`;
      default:
        return "Tất cả thời gian";
    }
  };
  // Home.jsx - Thêm vào phần tính toán (trong component, trước return)

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Thống kê ăn & chi phí</h1>
      <div className="grid grid-cols-4 gap-6">
        {/* Phần tổng quan - CHIẾM 3 CỘT */}
        <div className="col-span-3 space-y-6">
          {/* Các thẻ tổng quan */}
          {/* Các thẻ tổng quan */}
          <div className="grid grid-cols-3 gap-4">
            {/* Thẻ 1: Tổng số đơn */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Tổng số đơn</p>
              <p className="text-2xl font-bold">{statsOverview.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {statsOverview.cashOrders} tiền mặt • {statsOverview.cardOrders}{" "}
                thẻ ăn
              </p>
            </div>
            {/* Thẻ 2: Tổng chi tiêu */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-green-600">
                {statsOverview.totalSpent.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Trung bình:{" "}
                {(statsOverview.avgOrderValue || 0).toLocaleString()}đ/đơn
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
              <p className="text-gray-500 text-sm">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">
                {statsOverview.paidTotal.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {
                  filteredOrders.filter((o) => {
                    const isPaid =
                      o.status === "Đã thanh toán" ||
                      o.paid === true ||
                      o.paid === "true" ||
                      (typeof o.paid === "string" &&
                        o.paid.toLowerCase() === "true");
                    return isPaid;
                  }).length
                }{" "}
                đơn
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
              <p className="text-gray-500 text-sm">Chưa thanh toán</p>
              <p className="text-2xl font-bold text-red-600">
                {statsOverview.unpaidTotal.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {
                  filteredOrders.filter((o) => {
                    const isUnpaid =
                      o.status === "Chưa thanh toán" ||
                      o.paid === false ||
                      o.paid === "false" ||
                      (typeof o.paid === "string" &&
                        o.paid.toLowerCase() === "false");
                    return isUnpaid;
                  }).length
                }{" "}
                đơn
              </p>
            </div>
            {/* Thẻ 3: Đã thanh toán *
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
              <p className="text-gray-500 text-sm">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">
                {statsOverview.paidTotal.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {/* Tính số đơn đã thanh toán theo filter *
                {
                  filteredOrders.filter((o) => {
                    const isPaid =
                      o.payment_method === "meal_card" ||
                      o.paymentMethod === "meal_card" ||
                      o.status === "Đã thanh toán";
                    return isPaid;
                  }).length
                }{" "}
                đơn
              </p>
            </div>

            {/* Thẻ 4: Chưa thanh toán 
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
              <p className="text-gray-500 text-sm">Chưa thanh toán</p>
              <p className="text-2xl font-bold text-red-600">
                {statsOverview.unpaidTotal.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {/* Tính số đơn chưa thanh toán theo filter 
                {
                  filteredOrders.filter((o) => {
                    const isUnpaid =
                      o.payment_method === "cash" ||
                      o.paymentMethod === "cash" ||
                      o.status === "Chưa thanh toán";
                    return isUnpaid;
                  }).length
                }{" "}
                đơn
              </p>
            </div>*}

            {/* Thẻ 5: Tiền mặt */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-yellow-500">
              <p className="text-gray-500 text-sm">Đơn tiền mặt</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statsOverview.cashTotal.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {statsOverview.cashOrders} đơn
              </p>
            </div>
            {/* Thẻ 6: Thẻ ăn */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-indigo-500">
              <p className="text-gray-500 text-sm">Đơn thẻ ăn</p>
              <p className="text-2xl font-bold text-indigo-600">
                {statsOverview.cardTotal.toLocaleString()}đ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {statsOverview.cardOrders} đơn
                {statsOverview.cardTotal > 0 && " • Đã thanh toán"}
              </p>
            </div>
          </div>

          {/* Biểu đồ chi phí */}
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Biểu đồ chi phí theo thời gian</h3>
              <div className="flex gap-2">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`px-3 py-1 rounded-lg border text-sm ${
                      filter === f.key
                        ? "bg-green-600 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading.chart ? (
              <LoadingSpinner text="Đang tải biểu đồ..." />
            ) : errors.chart ? (
              <ErrorMessage
                error={errors.chart}
                onRetry={() => {
                  setLoading((prev) => ({ ...prev, chart: true }));
                  setErrors((prev) => ({ ...prev, chart: null }));
                  // Gọi lại API
                  fetch(
                    `http://localhost:5000/api/stats/chart?user_id=${userId}&filter=${filter}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      setChartData(Array.isArray(data) ? data : []);
                      setLoading((prev) => ({ ...prev, chart: false }));
                    })
                    .catch((err) => {
                      setErrors((prev) => ({ ...prev, chart: err.message }));
                      setLoading((prev) => ({ ...prev, chart: false }));
                    });
                }}
              />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toLocaleString()}đ`,
                      "Tổng tiền",
                    ]}
                    labelFormatter={(label) => `Thời gian: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Tổng tiền" fill="#16a34a" />
                  <Bar dataKey="paid" name="Đã thanh toán" fill="#22c55e" />
                  <Bar dataKey="unpaid" name="Chưa thanh toán" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <svg
                  className="w-16 h-16 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>Không có dữ liệu để hiển thị biểu đồ</p>
                <p className="text-sm mt-1">Hãy tạo đơn hàng để xem thống kê</p>
              </div>
            )}
          </div>

          {/* Top món ăn */}
          {/* Top món ăn - sửa hiển thị */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">
              Top món ăn được order nhiều nhất
            </h3>

            {loading.foods ? (
              <LoadingSpinner text="Đang tải danh sách món ăn..." />
            ) : errors.foods ? (
              <ErrorMessage error={errors.foods} />
            ) : topFoods.length > 0 ? (
              <div className="space-y-4">
                {topFoods.map((food, index) => {
                  // Tính giá trung bình nếu có
                  const avgPrice =
                    food.totalAmount > 0
                      ? food.totalRevenue / food.totalAmount
                      : food.price || 0;

                  return (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-gray-500">
                            Đã order {food.totalAmount} lần • {food.count} đơn
                            {avgPrice > 0 &&
                              ` • ${Math.round(
                                avgPrice
                              ).toLocaleString()}đ/phần`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {(food.totalRevenue || 0).toLocaleString()}đ
                        </p>
                        <p className="text-sm text-gray-500">
                          {food.totalAmount || 0} phần
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500">
                <svg
                  className="w-16 h-16 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Không có dữ liệu món ăn</p>
                <p className="text-sm mt-1">Hãy order món ăn để xem thống kê</p>
              </div>
            )}
          </div>

          {/* Bảng chi tiết đơn hàng */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Chi tiết đơn hàng</h3>
              <div className="flex gap-2">
                <select
                  value={selectedStatsFilter}
                  onChange={(e) => setSelectedStatsFilter(e.target.value)}
                  className="border rounded-lg px-3 py-1 text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                </select>
              </div>
            </div>

            {loading.orders ? (
              <LoadingSpinner text="Đang tải chi tiết đơn hàng..." />
            ) : errors.orders ? (
              <ErrorMessage error={errors.orders} />
            ) : filteredOrderDetails.length > 0 ? (
              <>
                <div className="overflow-x-auto max-h-[500px]">
                  {/* ... giữ nguyên phần bảng của bạn ... */}
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Hiển thị {filteredOrderDetails.length} đơn hàng
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Tổng tiền:</div>
                      <div className="text-xl font-bold text-green-600">
                        {filteredOrderDetails
                          .reduce((sum, o) => sum + o.total, 0)
                          .toLocaleString()}
                        đ
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p>Không có dữ liệu đơn hàng</p>
                <p className="text-sm mt-1">Hãy tạo đơn hàng đầu tiên</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR - CHIẾM 1 CỘT */}
        <div className="col-span-1 space-y-6">
          {/* Biểu đồ tròn - Phương thức thanh toán */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Phương thức thanh toán</h3>

            {loading.payment ? (
              <LoadingSpinner text="Đang tải thống kê..." />
            ) : errors.payment ? (
              <ErrorMessage error={errors.payment} />
            ) : paymentChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value.toLocaleString()}đ`}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {paymentChartData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {(item.value || 0).toLocaleString()}đ
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500">
                <svg
                  className="w-16 h-16 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>Không có dữ liệu</p>
              </div>
            )}
          </div>

          {/* Bộ lọc thời gian */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Lọc theo thời gian</h3>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full mb-3"
            />

            {/* Phần bộ lọc - thêm indicator */}
            <div className="flex flex-wrap gap-2 mb-6">
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`px-3 py-1 rounded-lg border text-sm flex items-center gap-2 ${
                    filter === f.key
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white hover:bg-gray-100 border-gray-300"
                  }`}
                  onClick={() => {
                    console.log(`Changing filter to: ${f.key}`);
                    setFilter(f.key);
                  }}
                >
                  {f.label}
                  {filter === f.key && (
                    <span className="text-xs bg-white text-green-600 px-1 rounded">
                      ✓
                    </span>
                  )}
                </button>
              ))}

              {/* Hiển thị filter info */}
              <div className="text-sm text-gray-500 ml-auto flex items-center">
                <span className="mr-2">Đang xem:</span>
                <span className="font-semibold text-green-600">
                  {DATE_FILTERS.find((f) => f.key === filter)?.label || filter}
                </span>
                <span className="mx-2">•</span>
                <span>{filteredOrders.length} đơn hàng</span>
              </div>
            </div>
          </div>

          {/* Xu hướng chi tiêu */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Xu hướng chi tiêu</h3>

            {loading.chart ? (
              <LoadingSpinner text="Đang tải..." />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()}đ`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Tổng tiền"
                    stroke="#16a34a"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>

          {/* Thông tin tổng kết */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Tổng kết nhanh</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng đơn hàng:</span>
                <span className="font-medium">{statsOverview.totalOrders}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng chi tiêu:</span>
                <span className="font-medium text-green-600">
                  {statsOverview.totalSpent.toLocaleString()}đ
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trung bình/đơn:</span>
                <span className="font-medium">
                  {(statsOverview.avgOrderValue || 0).toLocaleString()}đ
                </span>
              </div>

              <div className="pt-3 border-t">
                <button
                  onClick={handleViewDetailedReport}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Xem báo cáo chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Báo cáo chi tiết thống kê</h2>
              <p className="text-sm text-gray-600">
                Kỳ: {reportData.period} ({reportData.filter})
              </p>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {reportData ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b pb-4">
                    <h3 className="font-bold text-lg">BÁO CÁO THỐNG KÊ</h3>
                    <p className="text-gray-600">
                      Người dùng: {localStorage.getItem("user_name") || "Khách"}
                    </p>
                    <p className="text-gray-600">
                      Thời gian: {reportData.generatedAt}
                    </p>
                    <p className="text-gray-600">Kỳ: {reportData.period}</p>
                  </div>

                  {/* Tổng quan */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-3"> TỔNG QUAN</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Tổng đơn hàng:</span>{" "}
                          {reportData.userStats.totalOrders}
                        </p>
                        <p>
                          <span className="font-medium">Tổng chi tiêu:</span>{" "}
                          {reportData.userStats.totalSpent.toLocaleString()}đ
                        </p>
                        <p>
                          <span className="font-medium">Đã thanh toán:</span>{" "}
                          {reportData.userStats.paidTotal.toLocaleString()}đ
                        </p>
                        <p>
                          <span className="font-medium">Chưa thanh toán:</span>{" "}
                          {reportData.userStats.unpaidTotal.toLocaleString()}đ
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Trung bình/đơn:</span>{" "}
                          {reportData.userStats.avgOrderValue.toLocaleString()}đ
                        </p>
                        <p>
                          <span className="font-medium">Đơn tiền mặt:</span>{" "}
                          {reportData.userStats.cashTotal.toLocaleString()}đ
                        </p>
                        <p>
                          <span className="font-medium">Đơn thẻ ăn:</span>{" "}
                          {reportData.userStats.cardTotal.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top món ăn */}
                  <div>
                    <h4 className="font-bold mb-3">
                      TOP MÓN ĂN ĐƯỢC ORDER NHIỀU NHẤT
                    </h4>
                    {reportData.topFoods.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.topFoods.map((food, index) => (
                          <div
                            key={food.id}
                            className="flex justify-between items-center p-2 border rounded"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold">#{index + 1}</span>
                              <span>{food.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {food.totalAmount} phần
                              </p>
                              <p className="text-green-600">
                                {food.totalRevenue.toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa có dữ liệu</p>
                    )}
                  </div>

                  {/* Phân phối thanh toán */}
                  <div>
                    <h4 className="font-bold mb-3">
                      PHÂN PHỐI PHƯƠNG THỨC THANH TOÁN
                    </h4>
                    {reportData.paymentDistribution.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.paymentDistribution.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span>{item.name}:</span>
                            <span className="font-medium">
                              {item.value.toLocaleString()}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa có dữ liệu</p>
                    )}
                  </div>

                  {/* Đơn hàng gần nhất */}
                  <div>
                    <h4 className="font-bold mb-3">📋 10 ĐƠN HÀNG GẦN NHẤT</h4>
                    {reportData.recentOrders.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.recentOrders.map((order, index) => (
                          <div key={order.id} className="p-3 border rounded">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">
                                Đơn #{order.id}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  order.status === "Đã thanh toán"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>
                                {order.date} {order.time}
                              </span>
                              <span className="font-medium">
                                {order.total.toLocaleString()}đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa có đơn hàng</p>
                    )}
                  </div>

                  {/* Tổng kết */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">TỔNG KẾT</p>
                        <p className="text-sm text-gray-600">
                          Tổng số đơn: {reportData.userStats.totalOrders}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {reportData.userStats.totalSpent.toLocaleString()}đ
                        </p>
                        <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Đang tạo báo cáo...</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  // In báo cáo
                  window.print();
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                In báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

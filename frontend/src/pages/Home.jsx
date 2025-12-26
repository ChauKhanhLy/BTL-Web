import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StatsPage({ searchKeyword }) {
  const [filter, setFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");
  const [meals, setMeals] = useState([]);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId || !selectedDate) return;

    fetch(
      `http://localhost:5000/api/stats/meals?` +
        `user_id=${userId}&filter=${filter}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then(setMeals)
      .catch(console.error);
  }, [filter, selectedDate]);

  const filteredMeals = meals.filter((meal) => {
    // search theo món hoặc ngày
    const matchSearch =
      !searchKeyword ||
      meal.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      meal.date.includes(searchKeyword);

    if (!matchSearch) return false;

    if (!selectedDate) return true;

    const mealDate = new Date(meal.date);
    const pickedDate = new Date(selectedDate);

    if (filter === "today") {
      return meal.date === selectedDate;
    }

    if (filter === "week") {
      const startOfWeek = new Date(pickedDate);
      startOfWeek.setDate(pickedDate.getDate() - pickedDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return mealDate >= startOfWeek && mealDate <= endOfWeek;
    }

    if (filter === "month") {
      return (
        mealDate.getMonth() === pickedDate.getMonth() &&
        mealDate.getFullYear() === pickedDate.getFullYear()
      );
    }

    return true;
  });

  const totalPaid = filteredMeals
    .filter((m) => m.paid)
    .reduce((sum, m) => sum + m.price, 0);

  const totalUnpaid = filteredMeals
    .filter((m) => !m.paid)
    .reduce((sum, m) => sum + m.price, 0);
  const getChartData = () => {
    const result = {};

    filteredMeals.forEach((meal) => {
      let key = "";

      if (filter === "today" || filter === "week") {
        key = meal.date; // yyyy-mm-dd
      }

      if (filter === "month") {
        key = meal.date.slice(0, 7); // yyyy-mm
      }

      if (filter === "year") {
        key = meal.date.slice(0, 4); // yyyy
      }

      if (!result[key]) {
        result[key] = { time: key, total: 0 };
      }

      result[key].total += meal.price;
    });

    return Object.values(result);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Thống kê ăn & chi phí</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Tổng quan */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Số suất ăn</p>
              <p className="text-xl font-bold">{filteredMeals.length}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Đã trả</p>
              <p className="text-xl font-bold text-green-600">
                {totalPaid.toLocaleString()}đ
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Chưa trả</p>
              <p className="text-xl font-bold text-red-600">
                {totalUnpaid.toLocaleString()}đ
              </p>
            </div>
          </div>

          {/* Danh sách bữa ăn */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Ngày</th>
                  <th className="p-3">Món ăn</th>
                  <th className="p-3">Giá</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeals.map((meal) => (
                  <tr key={meal.id} className="border-t">
                    <td className="p-3">{meal.date}</td>
                    <td className="p-3">{meal.name}</td>
                    <td className="p-3">{meal.price.toLocaleString()}đ</td>
                    <td className="p-3">
                      {meal.paid ? (
                        <span className="text-green-600 font-medium">
                          Đã trả
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Chưa trả
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow space-y-3">
            <h3 className="font-semibold">Bộ lọc thời gian</h3>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />

            <div className="flex flex-wrap gap-2">
              {[
                { key: "today", label: "Hôm nay" },
                { key: "week", label: "Tuần" },
                { key: "month", label: "Tháng" },
                { key: "year", label: "Năm" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    filter === f.key
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Chi phí ăn</h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getChartData()}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* {/* Calendar filter 
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Bộ lọc thời gian 
      <div className="flex gap-3">
        {[
          { key: "today", label: "Hôm nay" },
          { key: "week", label: "Tuần này" },
          { key: "month", label: "Tháng này" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg border ${
              filter === f.key
                ? "bg-green-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

       Biểu đồ chi phí theo tháng 
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Chi phí ăn theo tháng</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>*/}
      </div>
    </>
  );
}

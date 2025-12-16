import React, { useState } from "react";

const mockMeals = [
  {
    id: 1,
    date: "2025-12-16",
    name: "Cơm gà nướng mật ong",
    price: 45000,
    paid: true,
  },
  {
    id: 2,
    date: "2025-12-16",
    name: "Salad ngũ cốc",
    price: 39000,
    paid: false,
  },
  {
    id: 3,
    date: "2025-12-14",
    name: "Phở bò tái",
    price: 35000,
    paid: true,
  },
];

export default function StatsPage() {
  const [filter, setFilter] = useState("today");

  const today = new Date().toISOString().slice(0, 10);

  const filteredMeals = mockMeals.filter((meal) => {
    if (filter === "today") return meal.date === today;
    if (filter === "week") return true; // giả lập
    if (filter === "month") return true;
    return true;
  });

  const totalPaid = filteredMeals
    .filter((m) => m.paid)
    .reduce((sum, m) => sum + m.price, 0);

  const totalUnpaid = filteredMeals
    .filter((m) => !m.paid)
    .reduce((sum, m) => sum + m.price, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thống kê ăn & chi phí</h1>

      {/* Bộ lọc thời gian */}
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
          <p className="text-gray-500">Chưa trả (trừ lương)</p>
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
                <td className="p-3">
                  {meal.price.toLocaleString()}đ
                </td>
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
  );
}

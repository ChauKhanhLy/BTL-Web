import React, { useState } from "react";
import { Plus, Search, Calendar, Filter } from "lucide-react";

export default function MenuManagementPage() {
    const [view, setView] = useState("week");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
                    <p className="text-sm text-gray-500">Lập kế hoạch thực đơn theo tuần</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm flex items-center gap-2">
                        <Calendar size={16} /> Tuần này
                    </button>
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">
                        Xuất file
                    </button>
                </div>
            </div>

            {/* Top controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    {["Tuần", "Ngày", "Tháng"].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(
                                v === "Tuần" ? "week" : v === "Ngày" ? "day" : "month"
                            )}
                            className={`px-4 py-1 rounded-full text-sm ${view === (v === "Tuần" ? "week" : v === "Ngày" ? "day" : "month")
                                    ? "bg-emerald-700 text-white"
                                    : "bg-gray-100"
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Tìm món ăn"
                            className="ml-2 outline-none text-sm"
                        />
                    </div>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-1">
                        <Plus size={16} /> Thêm món
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard title="Món đang bán" value="58" note="12 danh mục" />
                <StatCard title="Giá trung bình" value="₫45,800" note="Chưa bao gồm thuế" />
                <StatCard title="Hết hàng" value="4" note="Thuộc 3 món" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Menu by Day */}
                <section className="bg-white rounded-xl p-5 shadow">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold">Thực đơn theo ngày</h3>
                        <button className="text-sm bg-green-100 px-3 py-1 rounded">
                            Đặt lại tuần
                        </button>
                    </div>

                    {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"].map(day => (
                        <div key={day} className="border rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{day}</span>
                                <button className="text-gray-400">–</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                    Món mẫu
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                    Món khác
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Dish Library */}
                <section className="bg-white rounded-xl p-5 shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Danh sách món ăn</h3>
                        <button className="flex items-center gap-1 text-sm bg-green-100 px-3 py-1 rounded">
                            <Filter size={14} /> Bộ lọc
                        </button>
                    </div>

                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="flex justify-between items-center border rounded-lg p-3 mb-3"
                        >
                            <div>
                                <p className="font-medium">Tên món</p>
                                <p className="text-xs text-gray-500">
                                    Danh mục • ₫45,000
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-xs bg-green-100 rounded">
                                    Sửa
                                </button>
                                <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded">
                                    Lưu trữ
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, note }) {
    return (
        <div className="bg-green-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{note}</p>
        </div>
    );
}

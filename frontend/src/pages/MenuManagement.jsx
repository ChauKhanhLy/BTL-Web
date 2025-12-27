import React, { useState } from "react";
import { Plus, Search, Calendar, Filter, X, Upload } from "lucide-react";

export default function MenuManagementPage() {
    const [view, setView] = useState("week");
    const [openAdd, setOpenAdd] = useState(false);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
                    <p className="text-sm text-gray-500">
                        Lập kế hoạch thực đơn theo tuần
                    </p>
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
                    {[
                        { label: "Tuần", value: "week" },
                        { label: "Ngày", value: "day" },
                        { label: "Tháng", value: "month" },
                    ].map(v => (
                        <button
                            key={v.value}
                            onClick={() => setView(v.value)}
                            className={`px-4 py-1 rounded-full text-sm ${view === v.value
                                ? "bg-emerald-700 text-white"
                                : "bg-gray-100"
                                }`}
                        >
                            {v.label}
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
                    <button
                        onClick={() => setOpenAdd(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-1"
                    >
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
                    <h3 className="font-semibold mb-4">Thực đơn theo ngày</h3>
                    {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"].map(day => (
                        <div key={day} className="border rounded-lg p-3 mb-3">
                            <p className="font-medium">{day}</p>
                            <div className="flex gap-2 mt-2">
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
                    <div className="flex justify-between mb-4">
                        <h3 className="font-semibold">Danh sách món ăn</h3>
                        <button className="flex items-center gap-1 text-sm bg-green-100 px-3 py-1 rounded">
                            <Filter size={14} /> Bộ lọc
                        </button>
                    </div>

                    {[1, 2, 3].map(i => (
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

            {/* MODAL ADD MENU ITEM */}
            {openAdd && <AddMenuItemModal onClose={() => setOpenAdd(false)} />}
        </div>
    );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({ title, value, note }) {
    return (
        <div className="bg-green-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{note}</p>
        </div>
    );
}


function AddMenuItemModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            {/* Modal box */}
            <div className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        ➕ Thêm món ăn
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 px-3 py-1 rounded-full border text-sm hover:bg-gray-100"
                    >
                        <X size={14} /> Đóng
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-2 gap-6">

                    {/* LEFT */}
                    <div className="space-y-4">
                        <Field label="Tên món" placeholder="VD: Cá ngừ sốt cay" />
                        <Field label="Danh mục" placeholder="VD: Sushi" />

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Giá cơ bản" placeholder="₫ 45.000" />
                            <Field label="Mã món (SKU)" placeholder="MN-001" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Mô tả</label>
                            <textarea
                                className="w-full mt-1 px-4 py-2 border rounded-xl min-h-[90px]"
                                placeholder="Mô tả ngắn sẽ hiển thị trên thực đơn"
                            />
                        </div>

                        <Field
                            label="Thành phần"
                            placeholder="VD: Cá ngừ, cơm, rong biển, sốt mayo..."
                            note="Giúp quản lý nguyên liệu & tồn kho"
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Hình ảnh</label>
                            <div className="mt-2 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400">
                                <Upload size={28} />
                                <p className="text-sm mt-1">
                                    Kéo & thả hoặc tải ảnh lên
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Phiên bản món</label>
                            <div className="flex gap-2 mt-2">
                                <span className="px-3 py-1 border rounded-full text-sm">
                                    Thường — ₫45.000
                                </span>
                                <span className="px-3 py-1 border rounded-full text-sm">
                                    Lớn — ₫55.000
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Trạng thái</label>
                            <div className="mt-2 px-4 py-2 border rounded-xl text-sm">
                                Còn hàng • Chuẩn bị 10–15 phút
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-8">
                    <p className="text-xs text-gray-400">
                        Món sẽ được lưu nháp nếu chưa xuất bản.
                    </p>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border rounded-xl text-sm">
                            Lưu nháp
                        </button>
                        <button className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-sm">
                            Xuất bản món
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Field helper */
function Field({ label, placeholder, note }) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <input
                className="w-full mt-1 px-4 py-2 border rounded-xl"
                placeholder={placeholder}
            />
            {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
        </div>
    );
}

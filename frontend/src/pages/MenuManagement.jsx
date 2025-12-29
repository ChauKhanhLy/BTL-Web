import React, { useState } from "react";
import { Plus, Search, X, Upload } from "lucide-react";
import StatCard from "../components/StatCard";

/* ================= MAIN PAGE ================= */

export default function MenuManagementPage() {
    const [view, setView] = useState("week"); // week | day | all
    const [selectedDay, setSelectedDay] = useState("Thứ 2");
    const [editingDay, setEditingDay] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);
    const [openCreateDish, setOpenCreateDish] = useState(false);

    const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

    /* ===== DATA ===== */
    const categories = ["Tất cả", "Cơm", "Bún", "Mì", "Salad"];
    const [category, setCategory] = useState("Tất cả");

    const allDishes = [
        { name: "Cơm gà nướng mật ong", category: "Cơm", meta: "540 kcal", price: "45.000đ" },
        { name: "Cơm sườn nướng", category: "Cơm", meta: "600 kcal", price: "42.000đ" },
        { name: "Bún bò Huế", category: "Bún", meta: "Đặc biệt", price: "40.000đ" },
        { name: "Mì xào hải sản", category: "Mì", meta: "Hải sản", price: "48.000đ" },
        { name: "Salad ngũ cốc", category: "Salad", meta: "Thuần chay", price: "39.000đ" },
    ];

    const filteredDishes =
        category === "Tất cả"
            ? allDishes
            : allDishes.filter(d => d.category === category);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
                <p className="text-sm text-gray-500">
                    Quản lý thực đơn theo ngày / theo tuần / toàn bộ món
                </p>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard title="Món đang bán" value="58" sub="12 danh mục" />
                <StatCard title="Giá trung bình" value="₫45,800" sub="Chưa VAT" />
                <StatCard title="Hết hàng" value="4" sub="Cần cập nhật" />
            </div>

            {/* ===== TOP CONTROLS ===== */}
            <div className="flex justify-between items-center mb-4">
                {/* View switch */}
                <div className="flex items-center gap-2">
                    {[
                        { label: "Theo tuần", value: "week" },
                        { label: "Theo ngày", value: "day" },
                        { label: "Danh sách món", value: "all" },
                    ].map(v => (
                        <button
                            key={v.value}
                            onClick={() => {
                                setView(v.value);
                                setEditingDay(null);
                            }}
                            className={`px-4 py-1 rounded-full text-sm ${view === v.value
                                    ? "bg-emerald-700 text-white"
                                    : "bg-gray-100"
                                }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Tìm món..."
                            className="ml-2 outline-none text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setOpenCreateDish(true)}
                        className="px-4 py-2 bg-orange-500 text-white
                                   rounded-lg flex items-center gap-1"
                    >
                        <Plus size={16} /> Tạo món mới
                    </button>
                </div>
            </div>

            {/* ===== DAY SELECTOR ===== */}
            {view === "day" && (
                <div className="flex gap-2 mb-6">
                    {daysOfWeek.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-1 rounded-full text-sm ${selectedDay === day
                                    ? "bg-emerald-700 text-white"
                                    : "bg-gray-100"
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            )}

            {/* ===== CATEGORY FILTER ===== */}
            {view === "all" && (
                <div className="flex gap-2 mb-6">
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-4 py-1 rounded-full text-sm ${category === c
                                    ? "bg-emerald-700 text-white"
                                    : "bg-gray-100"
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/* ===== CONTENT ===== */}
            <div className="space-y-6">
                {/* WEEK / DAY VIEW */}
                {(view === "week" || view === "day") &&
                    (view === "week" ? daysOfWeek : [selectedDay]).map(day => (
                        <section key={day} className="bg-white rounded-xl p-5 shadow">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-semibold">{day}</h3>

                                {editingDay === day ? (
                                    <button
                                        onClick={() => setEditingDay(null)}
                                        className="px-3 py-1.5 rounded-lg text-sm bg-gray-100"
                                    >
                                        Xong
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setEditingDay(day)}
                                        className="px-3 py-1.5 rounded-lg text-sm border"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {allDishes.slice(0, 2).map(d => (
                                    <DailyMenuRow
                                        key={d.name}
                                        {...d}
                                        editable={editingDay === day}
                                        onRemove={() => setRemoveTarget(d.name)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                {/* ===== ALL DISHES VIEW ===== */}
                {view === "all" && (
                    <section className="bg-white rounded-xl p-5 shadow">
                        <h3 className="font-semibold mb-4">📋 Tất cả món ăn</h3>

                        <div className="space-y-3">
                            {filteredDishes.map(d => (
                                <DailyMenuRow
                                    key={d.name}
                                    {...d}
                                    editable={false}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ===== MODALS ===== */}
            {removeTarget && (
                <ConfirmRemoveModal
                    dishName={removeTarget}
                    onCancel={() => setRemoveTarget(null)}
                    onConfirm={() => setRemoveTarget(null)}
                />
            )}

            {openCreateDish && (
                <AddMenuItemModal onClose={() => setOpenCreateDish(false)} />
            )}
        </div>
    );
}

/* ================= COMPONENTS ================= */

function DailyMenuRow({ name, meta, price, editable, onRemove }) {
    return (
        <div className="flex justify-between items-center border rounded-2xl px-4 py-3">
            <div>
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-gray-500">
                    {meta}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{price}</span>

                {editable && (
                    <button
                        onClick={onRemove}
                        className="w-7 h-7 rounded-full bg-red-100 text-red-600"
                    >
                        −
                    </button>
                )}
            </div>
        </div>
    );
}

function ConfirmRemoveModal({ dishName, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl p-6">
                <h3 className="font-semibold mb-2">Xoá món?</h3>
                <p className="text-sm mb-4">
                    Bạn có chắc muốn xoá <b>{dishName}</b>?
                </p>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 border rounded-lg">
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                        Xoá
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddMenuItemModal({ onClose }) {
    const [preview, setPreview] = useState(null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-5xl rounded-2xl p-6">
                <div className="flex justify-between mb-6">
                    <h2 className="font-semibold text-lg">➕ Thêm món ăn</h2>
                    <button onClick={onClose}><X size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Field label="Tên món" />
                        <Field label="Danh mục" />
                        <Field label="Giá" />
                        <TextArea label="Mô tả" />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Hình ảnh</label>
                        <input
                            type="file"
                            hidden
                            id="menu-image"
                            accept="image/*"
                            onChange={e =>
                                setPreview(URL.createObjectURL(e.target.files[0]))
                            }
                        />
                        <label
                            htmlFor="menu-image"
                            className="mt-2 h-40 border-2 border-dashed rounded-xl
                                       flex items-center justify-center cursor-pointer"
                        >
                            {preview
                                ? <img src={preview} className="h-full w-full object-cover rounded-xl" />
                                : <Upload className="text-gray-400" />}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label }) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <input className="w-full mt-1 px-4 py-2 border rounded-xl" />
        </div>
    );
}

function TextArea({ label }) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <textarea className="w-full mt-1 px-4 py-2 border rounded-xl" />
        </div>
    );
}

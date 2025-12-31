import React, { useState } from "react";

export default function InventoryPage() {
    const [filter, setFilter] = useState("all");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Kho hàng</h1>
                    <p className="text-sm text-gray-500">Tổng quan tồn kho</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">
                        Tuần này
                    </button>
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">
                        Xuất file
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <input
                        placeholder="Tìm kiếm mặt hàng..."
                        className="px-3 py-2 rounded-lg border text-sm"
                    />
                    {["Tất cả", "Sắp hết", "Hết hàng"].map((f) => (
                        <button
                            key={f}
                            onClick={() =>
                                setFilter(
                                    f === "Tất cả"
                                        ? "all"
                                        : f === "Sắp hết"
                                            ? "low"
                                            : "out"
                                )
                            }
                            className={`px-3 py-2 rounded-lg text-sm ${filter ===
                                (f === "Tất cả"
                                    ? "all"
                                    : f === "Sắp hết"
                                        ? "low"
                                        : "out")
                                ? "bg-emerald-700 text-white"
                                : "bg-gray-100"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <select className="px-3 py-2 rounded-lg border text-sm">
                        <option>Danh mục: Tất cả</option>
                    </select>
                </div>

                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                    Thêm phiếu nhập
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Sản phẩm theo dõi"
                    value="128"
                    note="Tất cả danh mục"
                />
                <StatCard
                    title="Mặt hàng dưới định mức"
                    value="14"
                    note="Cần nhập thêm"
                />
                <StatCard
                    title="Lần nhập gần nhất"
                    value="₫6,240,000"
                    note="2 ngày trước"
                />
                <StatCard
                    title="Hao hụt tuần này"
                    value="₫420,000"
                    note="11% doanh thu"
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Current Stock */}
                <section className="col-span-2 bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-4">Tồn kho hiện tại</h3>

                    <table className="w-full text-sm">
                        <thead className="text-gray-500">
                            <tr>
                                <th className="text-left py-2">Mặt hàng</th>
                                <th>Tồn kho</th>
                                <th>Định mức</th>
                                <th>Nhà cung cấp</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockStock.map((item) => (
                                <tr key={item.name} className="border-t">
                                    <td className="py-2">{item.name}</td>
                                    <td className="text-center">
                                        {item.stock}
                                    </td>
                                    <td className="text-center">{item.par}</td>
                                    <td className="text-center">
                                        {item.supplier}
                                    </td>
                                    <td className="text-center">
                                        <button className="px-3 py-1 text-xs bg-green-100 rounded">
                                            Đặt thêm
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Suggestions */}
                <section className="bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-4">
                        Gợi ý nhập hàng
                    </h3>
                    {mockSuggestions.map((s) => (
                        <div
                            key={s}
                            className="flex justify-between items-center mb-2"
                        >
                            <span className="text-sm">{s}</span>
                            <button className="text-xs bg-green-100 px-2 py-1 rounded">
                                Thêm vào PO
                            </button>
                        </div>
                    ))}
                </section>
            </div>

            {/* Bottom */}
            <div className="grid grid-cols-2 gap-6 mt-6">
                <section className="bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-3">
                        Phiếu nhập gần đây
                    </h3>
                    <p className="text-sm text-gray-500">
                        PO-1248 • ₫2,460,000 • Đã thanh toán
                    </p>
                    <p className="text-sm text-gray-500">
                        PO-1247 • ₫1,820,000 • Chưa thanh toán
                    </p>
                </section>

                <section className="bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-3">
                        Tạo phiếu nhập
                    </h3>
                    <input
                        placeholder="Nhà cung cấp"
                        className="w-full mb-2 px-3 py-2 border rounded text-sm"
                    />
                    <button className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm">
                        Tạo PO
                    </button>
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

const mockStock = [
    {
        name: "Gạo Jasmine (10kg)",
        stock: 6,
        par: 8,
        supplier: "Saigon Foods"
    },
    {
        name: "Ức gà (kg)",
        stock: 12,
        par: 10,
        supplier: "FreshMeat Co."
    },
    {
        name: "Đậu hũ",
        stock: 4,
        par: 6,
        supplier: "Green Plant"
    }
];

const mockSuggestions = [
    "Dầu ăn (5L)",
    "Đậu hũ",
    "Gạo Jasmine (10kg)"
];

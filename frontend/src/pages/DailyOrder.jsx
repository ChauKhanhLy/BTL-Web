import React, { useState } from "react";

export default function OrdersPagecd() {
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const stats = [
        { label: "Đang xử lý", value: 8 },
        { label: "Đang giao", value: 6 },
        { label: "Hoàn thành", value: 12 },
        { label: "Đã hủy", value: 4 },
    ];

    const orders = [
        {
            id: "#ORD-001",
            customer: "Kelly Carter",
            date: "10:32 · Nhận tại quầy",
            total: "12.30$",
            status: "Đang xử lý",
        },
        {
            id: "#ORD-002",
            customer: "Miguel Martinez",
            date: "10:45 · Giao hàng",
            total: "18.90$",
            status: "Đang giao",
        },
        {
            id: "#ORD-003",
            customer: "Ana Patel",
            date: "11:02 · Nhận tại quầy",
            total: "9.70$",
            status: "Hoàn thành",
        },
    ];

    const filtered =
        statusFilter === "Tất cả"
            ? orders
            : orders.filter(o => o.status === statusFilter);

    return (
        <div className="space-y-6">
            {/* Tiêu đề */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Đơn hàng</h1>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 rounded-lg">
                        Xuất file
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg">
                        Tạo đơn mới
                    </button>
                </div>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">{s.label}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Bộ lọc */}
            <div className="flex gap-2">
                {["Tất cả", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-lg border ${statusFilter === s
                                ? "bg-green-600 text-white"
                                : "bg-white"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Bảng đơn hàng */}
            <div className="bg-white rounded-xl shadow">
                <table className="w-full text-sm">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="text-left p-3">Mã đơn</th>
                            <th className="text-left p-3">Khách hàng</th>
                            <th className="text-left p-3">Thời gian</th>
                            <th className="text-left p-3">Trạng thái</th>
                            <th className="text-left p-3">Tổng tiền</th>
                            <th className="text-left p-3">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id} className="border-t">
                                <td className="p-3 font-medium">{o.id}</td>
                                <td className="p-3">{o.customer}</td>
                                <td className="p-3 text-gray-500">{o.date}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                                        {o.status}
                                    </span>
                                </td>
                                <td className="p-3 font-semibold">{o.total}</td>
                                <td className="p-3">
                                    <button
                                        className="px-2 py-1 bg-green-100 rounded-lg"
                                        onClick={() => setSelectedOrder(o)}
                                    >
                                        Xem
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Chi tiết đơn hàng */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-[420px]">
                        <h2 className="font-bold text-xl mb-2">
                            Đơn hàng {selectedOrder.id}
                        </h2>
                        <p className="text-gray-600">
                            Khách hàng: {selectedOrder.customer}
                        </p>
                        <p className="text-gray-600">
                            Trạng thái: {selectedOrder.status}
                        </p>
                        <p className="font-bold mt-2">
                            Tổng tiền: {selectedOrder.total}
                        </p>

                        <div className="flex justify-end mt-4">
                            <button
                                className="px-3 py-1 border rounded-lg"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

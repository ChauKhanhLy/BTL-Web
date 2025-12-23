import React, { useState } from "react";

export default function OrdersPage() {
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const stats = [
        { label: "Processing", value: 8 },
        { label: "On the way", value: 6 },
        { label: "Completed", value: 12 },
        { label: "Cancelled", value: 4 },
    ];

    const orders = [
        {
            id: "#ORD-001",
            customer: "Kelly Carter",
            date: "10:32 AM · Pickup",
            total: "$12.30",
            status: "Processing",
        },
        {
            id: "#ORD-002",
            customer: "Miguel Martinez",
            date: "10:45 AM · Delivery",
            total: "$18.90",
            status: "On the way",
        },
        {
            id: "#ORD-003",
            customer: "Ana Patel",
            date: "11:02 AM · Pickup",
            total: "$9.70",
            status: "Completed",
        },
    ];

    const filtered = statusFilter === "All"
        ? orders
        : orders.filter(o => o.status === statusFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Orders</h1>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 rounded-lg">Export</button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg">New Order</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600">{s.label}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {["All", "Processing", "On the way", "Completed", "Cancelled"].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-lg border ${statusFilter === s ? "bg-green-600 text-white" : "bg-white"}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Orders table */}
            <div className="bg-white rounded-xl shadow">
                <table className="w-full text-sm">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="text-left p-3">Order</th>
                            <th className="text-left p-3">Customer</th>
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Total</th>
                            <th className="text-left p-3">Actions</th>
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
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order detail */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-[420px]">
                        <h2 className="font-bold text-xl mb-2">Order {selectedOrder.id}</h2>
                        <p className="text-gray-600">Customer: {selectedOrder.customer}</p>
                        <p className="text-gray-600">Status: {selectedOrder.status}</p>
                        <p className="font-bold mt-2">Total: {selectedOrder.total}</p>

                        <div className="flex justify-end mt-4">
                            <button
                                className="px-3 py-1 border rounded-lg"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

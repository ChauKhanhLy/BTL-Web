import React, { useState } from "react";

export default function InventoryPage() {
    const [filter, setFilter] = useState("all");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Inventory</h1>
                    <p className="text-sm text-gray-500">Stock Overview</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">This Week</button>
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">Export</button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <input
                        placeholder="Search items..."
                        className="px-3 py-2 rounded-lg border text-sm"
                    />
                    {["All", "Low", "Out"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            className={`px-3 py-2 rounded-lg text-sm ${filter === f.toLowerCase() ? "bg-emerald-700 text-white" : "bg-gray-100"}`}
                        >
                            {f}
                        </button>
                    ))}
                    <select className="px-3 py-2 rounded-lg border text-sm">
                        <option>Category: All</option>
                    </select>
                </div>

                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                    Add Purchase
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="SKUs Tracked" value="128" note="Across all categories" />
                <StatCard title="Items Below Par" value="14" note="Needs restock" />
                <StatCard title="Last Purchase" value="₫6,240,000" note="2 days ago" />
                <StatCard title="Waste This Week" value="₫420,000" note="11% of sales" />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Current Stock */}
                <section className="col-span-2 bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-4">Current Stock</h3>

                    <table className="w-full text-sm">
                        <thead className="text-gray-500">
                            <tr>
                                <th className="text-left py-2">Item</th>
                                <th>In Stock</th>
                                <th>Par</th>
                                <th>Supplier</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockStock.map((item) => (
                                <tr key={item.name} className="border-t">
                                    <td className="py-2">{item.name}</td>
                                    <td className="text-center">{item.stock}</td>
                                    <td className="text-center">{item.par}</td>
                                    <td className="text-center">{item.supplier}</td>
                                    <td className="text-center">
                                        <button className="px-3 py-1 text-xs bg-green-100 rounded">Reorder</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Suggestions */}
                <section className="bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-4">Restock Suggestions</h3>
                    {mockSuggestions.map((s) => (
                        <div key={s} className="flex justify-between items-center mb-2">
                            <span className="text-sm">{s}</span>
                            <button className="text-xs bg-green-100 px-2 py-1 rounded">Add to PO</button>
                        </div>
                    ))}
                </section>
            </div>

            {/* Bottom */}
            <div className="grid grid-cols-2 gap-6 mt-6">
                <section className="bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-3">Recent Purchases</h3>
                    <p className="text-sm text-gray-500">PO-1248 • ₫2,460,000 • Paid</p>
                    <p className="text-sm text-gray-500">PO-1247 • ₫1,820,000 • Due</p>
                </section>

                <section className="bg-white rounded-xl p-5 shadow">
                    <h3 className="font-semibold mb-3">Create Purchase Order</h3>
                    <input placeholder="Supplier" className="w-full mb-2 px-3 py-2 border rounded text-sm" />
                    <button className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm">Generate PO</button>
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
    { name: "Jasmine Rice (10kg)", stock: 6, par: 8, supplier: "Saigon Foods" },
    { name: "Chicken Breast (kg)", stock: 12, par: 10, supplier: "FreshMeat Co." },
    { name: "Tofu Blocks", stock: 4, par: 6, supplier: "Green Plant" },
];

const mockSuggestions = ["Cooking Oil (5L)", "Tofu Blocks", "Jasmine Rice (10kg)"];

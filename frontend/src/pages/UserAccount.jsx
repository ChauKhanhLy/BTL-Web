import React, { useState } from "react";
import { Search, UserPlus, Bell, Download } from "lucide-react";

export default function UserAccountPage() {
    const [statusFilter, setStatusFilter] = useState("all");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Search customers, emails, phone..."
                            className="ml-2 outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-sm bg-white px-3 py-2 rounded-lg shadow">
                        <Bell size={16} /> Alerts
                    </button>
                    <button className="flex items-center gap-1 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg">
                        <UserPlus size={16} /> New Customer
                    </button>
                </div>
            </div>

            {/* Breadcrumb & Filters */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">Users &gt; Customer Admin</div>
                <div className="flex gap-2">
                    {["All", "Verified", "Unverified", "Suspended"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s.toLowerCase())}
                            className={`px-3 py-1 rounded-full text-sm ${statusFilter === s.toLowerCase() ? "bg-green-600 text-white" : "bg-gray-100"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex gap-2 mb-6">
                <input placeholder="Search by name, email, phone..." className="px-3 py-2 rounded-lg border text-sm" />
                <select className="px-3 py-2 rounded-lg border text-sm"><option>Region: All</option></select>
                <select className="px-3 py-2 rounded-lg border text-sm"><option>Joined: Any</option></select>
                <select className="px-3 py-2 rounded-lg border text-sm"><option>Status: Any</option></select>
                <button className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg shadow text-sm">
                    <Download size={14} /> Export
                </button>
                <button className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg shadow text-sm">
                    Send invite
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="Total customers" value="12,480" />
                <StatCard title="Verified" value="10,932" />
                <StatCard title="Unverified" value="1,318" />
                <StatCard title="Suspended" value="230" />
            </div>

            {/* Customer Directory */}
            <section className="bg-white rounded-xl p-5 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Customer directory</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-100 rounded text-sm">Export</button>
                        <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Add customer</button>
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                        <tr>
                            <th className="text-left py-2">Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map((u) => (
                            <tr key={u.email} className="border-b last:border-0">
                                <td className="py-3 flex items-center gap-2">
                                    <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                </td>
                                <td className="text-center">{u.email}</td>
                                <td className="text-center">{u.phone}</td>
                                <td className="text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusColor(u.status)}`}>{u.status}</span>
                                </td>
                                <td className="text-center space-x-2">
                                    <button className="px-3 py-1 bg-green-100 rounded text-xs">View</button>
                                    {u.status === "Verified" && <button className="px-3 py-1 bg-green-100 rounded text-xs">Grant access</button>}
                                    {u.status === "Unverified" && <button className="px-3 py-1 bg-green-100 rounded text-xs">Send invite</button>}
                                    {u.status === "Suspended" && <button className="px-3 py-1 bg-green-100 rounded text-xs">Unsuspend</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="bg-green-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function statusColor(status) {
    if (status === "Verified") return "bg-green-200 text-green-800";
    if (status === "Unverified") return "bg-orange-200 text-orange-800";
    return "bg-red-200 text-red-800";
}

const mockUsers = [
    { name: "Lan Pham", email: "lan.pham@example.com", phone: "+84 912 345 678", status: "Verified" },
    { name: "Minh Tran", email: "minh.tran@example.com", phone: "+84 935 222 111", status: "Unverified" },
    { name: "Huy Nguyen", email: "huy.nguyen@example.com", phone: "+84 901 777 333", status: "Verified" },
    { name: "Thu Le", email: "thu.le@example.com", phone: "+84 988 456 120", status: "Suspended" },
];
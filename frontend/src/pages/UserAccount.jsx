import React, { useState, useEffect } from "react";
import { Search, UserPlus, Bell, Download } from "lucide-react";
import axios from "axios"; // Ensure axios is installed

const API_URL = "http://localhost:3000/api/admin";

export default function UserAccountPage() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0, suspended: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/users`, {
                params: { status: statusFilter, search: searchTerm }
            });
            setUsers(res.data.users);
            setStats(res.data.stats);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timer);
    }, [statusFilter, searchTerm]);

    const updateUserStatus = async (id, newStatus) => {
        try {
            await axios.patch(`${API_URL}/users/${id}/status`, { status: newStatus });
            fetchData();
            alert("Status updated successfully!");
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const sendInvite = async (id) => {
        try {
            await axios.post(`${API_URL}/users/${id}/invite`);
            alert("Invite sent successfully!");
        } catch (error) {
            alert("Failed to send invite");
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["Name,Email,Phone,Status"].join(",") + "\n"
            + users.map(u => `${u.name},${u.email},${u.phone},${u.status}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customers.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Search customers..."
                            className="ml-2 outline-none text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
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

            <div className="flex gap-2 mb-6 flex-wrap">
                <input 
                    placeholder="Search by name, email..." 
                    className="px-3 py-2 rounded-lg border text-sm" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg shadow text-sm hover:bg-gray-50">
                    <Download size={14} /> Export
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="Total customers" value={stats.total} />
                <StatCard title="Verified" value={stats.verified} />
                <StatCard title="Unverified" value={stats.unverified} />
                <StatCard title="Suspended" value={stats.suspended} />
            </div>

            <section className="bg-white rounded-xl p-5 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Customer directory</h3>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="px-3 py-1 bg-green-100 rounded text-sm hover:bg-green-200">Export</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
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
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No users found.</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 flex items-center gap-2">
                                            <img src={u.avatar_url || "https://via.placeholder.com/32"} className="w-8 h-8 rounded-full" alt="" />
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.region || 'Unknown Region'}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">{u.email}</td>
                                        <td className="text-center">{u.phone}</td>
                                        <td className="text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusColor(u.status)}`}>{u.status}</span>
                                        </td>
                                        <td className="text-center space-x-2">
                                            {u.status === "Verified" && (
                                                <button 
                                                    onClick={() => updateUserStatus(u.id, "Suspended")}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            {u.status === "Unverified" && (
                                                <>
                                                    <button 
                                                        onClick={() => updateUserStatus(u.id, "Verified")}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                                    >
                                                        Verify
                                                    </button>
                                                    <button 
                                                        onClick={() => sendInvite(u.id)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                                                    >
                                                        Resend Invite
                                                    </button>
                                                </>
                                            )}
                                            {u.status === "Suspended" && (
                                                <button 
                                                    onClick={() => updateUserStatus(u.id, "Verified")}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                                >
                                                    Unsuspend
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
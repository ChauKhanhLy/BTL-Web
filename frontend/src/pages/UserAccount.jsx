import React, { useState, useEffect } from "react";
import { Search, UserPlus, Bell } from "lucide-react";
import userApi from "../api/user.api.js";

export default function UserAccountPage() {
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    
    // Initialize with safe empty values
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0, suspended: 0 });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll({ status: statusFilter, search: searchTerm });
            
            // FIX: Check if res exists and use fallback values for stats
            if (res) {
                setUsers(res.users || []);
                setStats(res.stats || { total: 0, verified: 0, unverified: 0, suspended: 0 });
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            // In case of error, ensure UI doesn't crash
            setUsers([]);
            setStats({ total: 0, verified: 0, unverified: 0, suspended: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [statusFilter, searchTerm]);

    const handleAction = async (id, action) => {
        try {
            if (action === 'invite') {
                await userApi.sendInvite(id);
                alert("Đã gửi lời mời!");
            } else {
                await userApi.updateStatus(id, action);
                fetchData();
            }
        } catch (error) {
            alert("Thao tác thất bại");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Tìm kiếm..."
                            className="ml-2 outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-sm bg-white px-3 py-2 rounded-lg shadow">
                        <Bell size={16} /> Thông báo
                    </button>
                    <button className="flex items-center gap-1 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg">
                        <UserPlus size={16} /> Thêm khách hàng
                    </button>
                </div>
            </div>

            {/* Breadcrumb & Filter */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">Người dùng &gt; Quản lý khách hàng</div>
                <div className="flex gap-2">
                    {["Tất cả", "Đã xác thực", "Chưa xác thực", "Bị khóa"].map((s) => {
                        const key = s === "Tất cả" ? "all" : s === "Đã xác thực" ? "verified" : s === "Chưa xác thực" ? "unverified" : "suspended";
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(key)}
                                className={`px-3 py-1 rounded-full text-sm ${statusFilter === key ? "bg-green-600 text-white" : "bg-gray-100"}`}
                            >
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats Cards - Now safely accesses stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="Tổng khách hàng" value={stats.total} />
                <StatCard title="Đã xác thực" value={stats.verified} />
                <StatCard title="Chưa xác thực" value={stats.unverified} />
                <StatCard title="Bị khóa" value={stats.suspended} />
            </div>

            {/* Table */}
            <section className="bg-white rounded-xl p-5 shadow">
                <table className="w-full text-sm">
                    <thead className="text-gray-500 border-b">
                        <tr>
                            <th className="text-left py-2">Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">Không tìm thấy dữ liệu</td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="border-b last:border-0">
                                    <td className="py-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                        <p className="font-medium">{u.name}</p>
                                    </td>
                                    <td className="text-center">{u.gmail}</td>
                                    <td className="text-center">{u.sdt}</td>
                                    <td className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${statusColor(u.status)}`}>
                                            {translateStatus(u.status)}
                                        </span>
                                    </td>
                                    <td className="text-center space-x-2">
                                        {u.status === "Verified" && (
                                            <button onClick={() => handleAction(u.id, 'suspend')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs">Khóa</button>
                                        )}
                                        {u.status === "Unverified" && (
                                            <>
                                                <button onClick={() => handleAction(u.id, 'verify')} className="px-3 py-1 bg-green-100 rounded text-xs">Xác thực</button>
                                                <button onClick={() => handleAction(u.id, 'invite')} className="px-3 py-1 bg-blue-100 rounded text-xs">Mời</button>
                                            </>
                                        )}
                                        {u.status === "Suspended" && (
                                            <button onClick={() => handleAction(u.id, 'unlock')} className="px-3 py-1 bg-green-100 rounded text-xs">Mở khóa</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
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
            <p className="text-2xl font-bold">{value || 0}</p>
        </div>
    );
}

function statusColor(status) {
    if (status === "Verified") return "bg-green-200 text-green-800";
    if (status === "Unverified") return "bg-orange-200 text-orange-800";
    return "bg-red-200 text-red-800";
}

function translateStatus(status) {
    if (status === "Verified") return "Đã xác thực";
    if (status === "Unverified") return "Chưa xác thực";
    return "Bị khóa";
}
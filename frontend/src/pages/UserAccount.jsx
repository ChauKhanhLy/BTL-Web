import React, { useState, useEffect } from "react";
import { Search, UserPlus, Bell } from "lucide-react";
import userService from "../services/userService";
export default function UserAccountPage() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        suspended: 0,
    });

    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await userService.fetchUsers({
                status: statusFilter,
                search: searchTerm,
            });

            console.log("=== USER STATUS DEBUG ===");
            if (res.users?.length > 0) {
                console.table(res.users.map(u => ({
                    ID: u.id,
                    Tên: u.name,
                    Email: u.gmail,
                    'Status (RAW)': `"${u.status}"`,
                    'Status length': u.status?.length,
                    'lowercase': u.status?.toLowerCase(),
                    'trim': u.status?.trim(),
                    'is Verified?': u.status?.toLowerCase() === 'verified'
                })));
            } else {
                console.log("Không có user nào");
            }
            console.log("Stats:", res.stats);
            // ============ END DEBUG ============

            setUsers(res.users || []);
            setStats(res.stats || {
                total: 0,
                verified: 0,
                unverified: 0,
                locked: 0,
            });
        } catch (e) {
            console.error("Fetch users failed", e);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [statusFilter, searchTerm]);

    const handleAction = async (id, action) => {
        console.log("=== HANDLE ACTION ===");
        console.log("User ID:", id);
        console.log("Action:", action);

        try {
            if (action === "invite") {
                console.log("Sending invite...");
                await userService.inviteUser(id);
                alert("Đã gửi lời mời");
                return;
            }

            // MAP ACTION TỪ FE -> STATUS CHO BE (DÙNG "locked" thay vì "Suspended")
            const actionToStatusMap = {
                "verify": "Verified",      // Khi click "Xác thực" → "Verified"
                "suspend": "Locked",       // Khi click "Khóa" → "locked" 
                "unlock": "Verified"       // Khi click "Mở khóa" → "Verified"
            };

            const status = actionToStatusMap[action];

            if (!status) {
                throw new Error(`Không tìm thấy mapping cho action: ${action}`);
            }

            console.log("Mapping action to status:", { action, status });
            console.log("Calling updateUserStatus with:", { id, status });

            const result = await userService.updateUserStatus(id, status);

            console.log("Update result:", result);
            console.log("Update success, refreshing data...");

            fetchData();
        } catch (error) {
            console.error("=== ACTION ERROR DETAILS ===");
            console.error("Full error object:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);

            if (error.isAxiosError) {
                console.error("Is axios error: YES");
                console.error("Error response data:", error.response?.data);
                console.error("Error response status:", error.response?.status);
                console.error("Error config URL:", error.config?.url);
                console.error("Error config method:", error.config?.method);
                console.error("Error config data:", error.config?.data);

                const errorMessage = error.response?.data?.error || error.message;
                alert("Thao tác thất bại: " + errorMessage);
            } else {
                console.error("Is axios error: NO");
                alert("Thao tác thất bại: " + error.message);
            }
        }
    };
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                    <Search size={16} className="text-gray-400" />
                    <input
                        placeholder="Tìm kiếm..."
                        className="ml-2 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-1 text-sm bg-white px-3 py-2 rounded-lg shadow">
                        <Bell size={16} /> Thông báo
                    </button>
                    <button
                        onClick={() => setOpenAdd(true)}
                        className="flex items-center gap-1 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg"
                    >
                        <UserPlus size={16} /> Thêm khách hàng
                    </button>
                </div>
            </div>

            {/* FILTER */}
            <div className="flex gap-2 mb-6">
                {["Tất cả", "Đã xác thực", "Chưa xác thực", "Bị khóa"].map((s) => {
                    const key =
                        s === "Tất cả"
                            ? "all"
                            : s === "Đã xác thực"
                                ? "verified"
                                : s === "Chưa xác thực"
                                    ? "unverified"
                                    : "suspended";
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(key)}
                            className={`px-3 py-1 rounded-full text-sm ${statusFilter === key
                                ? "bg-green-600 text-white"
                                : "bg-gray-100"
                                }`}
                        >
                            {s}
                        </button>
                    );
                })}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="Tổng khách hàng" value={stats.total} />
                <StatCard title="Đã xác thực" value={stats.verified} />
                <StatCard title="Chưa xác thực" value={stats.unverified} />
                <StatCard title="Bị khóa" value={stats.locked} />
            </div>

            {/* TABLE */}
            <section className="bg-white rounded-xl p-5 shadow">
                <table className="w-full text-sm">
                    <thead className="border-b text-gray-500">
                        <tr>
                            <th className="text-left py-2">Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className="border-b hover:bg-gray-50 cursor-pointer"
                                >
                                    <td className="py-3 font-medium">{u.name}</td>
                                    <td className="text-center">{u.gmail}</td>
                                    <td className="text-center">{u.sdt}</td>
                                    <td className="text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${statusColor(
                                                u.status
                                            )}`}
                                        >
                                            {translateStatus(u.status)}
                                        </span>
                                    </td>
                                    <td
                                        className="text-center space-x-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {u.status === "Verified" && (
                                            <button
                                                onClick={() => handleAction(u.id, "suspend")}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs"
                                            >
                                                Khóa
                                            </button>
                                        )}
                                        {u.status === "Unverified" && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(u.id, "verify")}
                                                    className="px-3 py-1 bg-green-100 rounded text-xs"
                                                >
                                                    Xác thực
                                                </button>
                                                <button
                                                    onClick={() => handleAction(u.id, "invite")}
                                                    className="px-3 py-1 bg-blue-100 rounded text-xs"
                                                >
                                                    Mời
                                                </button>
                                            </>
                                        )}
                                        {u.status === "Locked" && (
                                            <button
                                                onClick={() => handleAction(u.id, "unlock")}
                                                className="px-3 py-1 bg-green-100 rounded text-xs"
                                            >
                                                Mở khóa
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>

            {openAdd && (
                <AddCustomerModal
                    onClose={() => setOpenAdd(false)}
                    onAdd={async (data) => {
                        await userService.createUser(data);
                        setOpenAdd(false);
                        fetchData();
                    }}
                />
            )}

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onDelete={async (id) => {
                        if (!confirm("Xóa khách hàng này?")) return;
                        await userService.deleteUser(id);
                        setSelectedUser(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
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

    function AddCustomerModal({ onClose, onAdd }) {
        const [name, setName] = React.useState("");
        const [gmail, setGmail] = React.useState("");
        const [sdt, setSdt] = React.useState("");

        const handleSubmit = () => {
            if (!name || !gmail || !sdt) {
                alert("Vui lòng nhập đủ thông tin");
                return;
            }
            onAdd({ name, gmail, sdt });
        };

        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white w-[400px] rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Thêm khách hàng</h2>
                    <input className="w-full border p-2 mb-2" placeholder="Tên" value={name} onChange={e => setName(e.target.value)} />
                    <input className="w-full border p-2 mb-2" placeholder="Email" value={gmail} onChange={e => setGmail(e.target.value)} />
                    <input className="w-full border p-2 mb-2" placeholder="SĐT" value={sdt} onChange={e => setSdt(e.target.value)} />

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose}>Hủy</button>
                        <button onClick={handleSubmit} className="bg-green-600 text-white px-3 py-1 rounded">Thêm</button>
                    </div>
                </div>
            </div>
        );
    }

    function UserDetailModal({ user, onClose, onDelete }) {
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl w-[400px]">
                    <h2 className="font-bold mb-4">Thông tin khách hàng</h2>
                    <p><b>Tên:</b> {user.name}</p>
                    <p><b>Email:</b> {user.gmail}</p>
                    <p><b>SĐT:</b> {user.sdt}</p>
                    <div className="flex justify-between mt-4">
                        <button onClick={() => onDelete(user.id)} className="text-red-600">Xóa</button>
                        <button onClick={onClose}>Đóng</button>
                    </div>
                </div>
            </div>
        );
    }

}

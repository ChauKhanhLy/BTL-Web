import React, { useState } from "react";
import { Search, UserPlus, Bell, Download } from "lucide-react";

export default function UserAccountPage() {
    const [statusFilter, setStatusFilter] = useState("all");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Thanh trên */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow">
                        <Search size={16} className="text-gray-400" />
                        <input
                            placeholder="Tìm kiếm khách hàng, email, số điện thoại..."
                            className="ml-2 outline-none text-sm"
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

            {/* Breadcrumb & bộ lọc */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                    Người dùng &gt; Quản lý khách hàng
                </div>
                <div className="flex gap-2">
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
            </div>

            {/* Bộ lọc nâng cao */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <input
                    placeholder="Tìm theo tên, email, số điện thoại..."
                    className="px-3 py-2 rounded-lg border text-sm"
                />
                <select className="px-3 py-2 rounded-lg border text-sm">
                    <option>Khu vực: Tất cả</option>
                </select>
                <select className="px-3 py-2 rounded-lg border text-sm">
                    <option>Ngày tham gia: Bất kỳ</option>
                </select>
                <select className="px-3 py-2 rounded-lg border text-sm">
                    <option>Trạng thái: Bất kỳ</option>
                </select>
                <button className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg shadow text-sm">
                    <Download size={14} /> Xuất dữ liệu
                </button>
                <button className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg shadow text-sm">
                    Gửi lời mời
                </button>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="Tổng khách hàng" value="12.480" />
                <StatCard title="Đã xác thực" value="10.932" />
                <StatCard title="Chưa xác thực" value="1.318" />
                <StatCard title="Bị khóa" value="230" />
            </div>

            {/* Danh sách khách hàng */}
            <section className="bg-white rounded-xl p-5 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Danh sách khách hàng</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-100 rounded text-sm">
                            Xuất file
                        </button>
                        <button className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">
                            Thêm khách hàng
                        </button>
                    </div>
                </div>

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
                        {mockUsers.map((u) => (
                            <tr key={u.email} className="border-b last:border-0">
                                <td className="py-3 flex items-center gap-2">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${u.name}`}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {u.email}
                                        </p>
                                    </div>
                                </td>
                                <td className="text-center">{u.email}</td>
                                <td className="text-center">{u.phone}</td>
                                <td className="text-center">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${statusColor(
                                            u.status
                                        )}`}
                                    >
                                        {u.status === "Verified"
                                            ? "Đã xác thực"
                                            : u.status === "Unverified"
                                                ? "Chưa xác thực"
                                                : "Bị khóa"}
                                    </span>
                                </td>
                                <td className="text-center space-x-2">
                                    <button className="px-3 py-1 bg-green-100 rounded text-xs">
                                        Xem
                                    </button>
                                    {u.status === "Verified" && (
                                        <button className="px-3 py-1 bg-green-100 rounded text-xs">
                                            Cấp quyền
                                        </button>
                                    )}
                                    {u.status === "Unverified" && (
                                        <button className="px-3 py-1 bg-green-100 rounded text-xs">
                                            Gửi lời mời
                                        </button>
                                    )}
                                    {u.status === "Suspended" && (
                                        <button className="px-3 py-1 bg-green-100 rounded text-xs">
                                            Mở khóa
                                        </button>
                                    )}
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
    {
        name: "Lan Phạm",
        email: "lan.pham@example.com",
        phone: "0912 345 678",
        status: "Verified",
    },
    {
        name: "Minh Trần",
        email: "minh.tran@example.com",
        phone: "0935 222 111",
        status: "Unverified",
    },
    {
        name: "Huy Nguyễn",
        email: "huy.nguyen@example.com",
        phone: "0901 777 333",
        status: "Verified",
    },
    {
        name: "Thu Lê",
        email: "thu.le@example.com",
        phone: "0988 456 120",
        status: "Suspended",
    },
];

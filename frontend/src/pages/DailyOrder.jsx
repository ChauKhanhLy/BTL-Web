import { useState } from "react";
import {
    Users,
    Utensils,
    UserX,
    Wallet,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

/* ================= MOCK DATA ================= */

const DATA_BY_RANGE = {
    day: {
        stats: { reg: 68, real: 64, noshow: "5.9%", paid: "90%", debt: 7 },
        chart: [
            { name: "Sáng", reg: 30, real: 28, noshow: 2 },
            { name: "Trưa", reg: 38, real: 36, noshow: 2 },
        ],
    },
    week: {
        stats: { reg: 482, real: 457, noshow: "5.2%", paid: "92%", debt: 38 },
        chart: [
            { name: "T2", reg: 70, real: 66, noshow: 4 },
            { name: "T3", reg: 68, real: 65, noshow: 3 },
            { name: "T4", reg: 72, real: 69, noshow: 3 },
            { name: "T5", reg: 74, real: 70, noshow: 4 },
            { name: "T6", reg: 78, real: 75, noshow: 3 },
            { name: "T7", reg: 65, real: 60, noshow: 5 },
            { name: "CN", reg: 55, real: 52, noshow: 3 },
        ],
    },
    month: {
        stats: { reg: 1980, real: 1872, noshow: "5.4%", paid: "89%", debt: 112 },
        chart: [
            { name: "Tuần 1", reg: 480, real: 455, noshow: 25 },
            { name: "Tuần 2", reg: 500, real: 472, noshow: 28 },
            { name: "Tuần 3", reg: 510, real: 480, noshow: 30 },
            { name: "Tuần 4", reg: 490, real: 465, noshow: 25 },
        ],
    },
};

/* ================= PAGE ================= */

export default function OrdersPage() {
    const [range, setRange] = useState("week");

    const { stats, chart } = DATA_BY_RANGE[range];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Theo dõi & thống kê suất ăn NLD
                    </h1>
                    <p className="text-sm text-gray-500">
                        Quản lý đăng ký, thực tế ăn, chi phí và tình trạng thanh toán
                    </p>
                </div>

                {/* FILTER */}
                <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
                    {["day", "week", "month"].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 text-sm transition
                ${range === r
                                    ? "bg-emerald-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {r === "day" && "Ngày"}
                            {r === "week" && "Tuần"}
                            {r === "month" && "Tháng"}
                        </button>
                    ))}
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="NLD đăng ký"
                    value={stats.reg}
                    icon={<Users className="text-green-700" />}
                    color="bg-green-100"
                />
                <StatCard
                    title="NLD thực tế đến ăn"
                    value={stats.real}
                    icon={<Utensils className="text-blue-700" />}
                    color="bg-blue-100"
                />
                <StatCard
                    title="No-show"
                    value={stats.noshow}
                    icon={<UserX className="text-orange-700" />}
                    color="bg-orange-100"
                />
                <StatCard
                    title="Đã đóng phí"
                    value={stats.paid}
                    sub={`${stats.debt} NLD còn nợ`}
                    icon={<Wallet className="text-emerald-700" />}
                    color="bg-emerald-100"
                />
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TABLE */}
                <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm">
                    <h2 className="font-semibold mb-4">
                        Danh sách NLD ({range === "day" ? "Ngày" : range === "week" ? "Tuần" : "Tháng"})
                    </h2>

                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-500">
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ tên</th>
                                <th>Đăng ký</th>
                                <th>Thực tế</th>
                                <th>No-show</th>
                                <th>Phí tháng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <Row code="NV001" name="Nguyễn Văn A" reg={22} real={22} noshow={0} fee="880.000đ" status="paid" />
                            <Row code="NV024" name="Trần Thị B" reg={20} real={18} noshow={2} fee="720.000đ" status="pending" />
                            <Row code="NV057" name="Lê Minh C" reg={22} real={19} noshow={3} fee="760.000đ" status="debt" />
                        </tbody>
                    </table>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-6">
                    {/* BAR CHART */}
                    <div className="bg-white rounded-xl p-5 shadow-sm h-72">
                        <h2 className="font-semibold mb-4">
                            Biểu đồ đăng ký, thực tế & no-show
                        </h2>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="reg" name="Đăng ký" fill="#16a34a" />
                                <Bar dataKey="real" name="Thực tế" fill="#2563eb" />
                                <Bar dataKey="noshow" name="No-show" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* PAYMENT SUMMARY */}
                    <div className="bg-white rounded-xl p-5 shadow-sm">
                        <h2 className="font-semibold mb-4">
                            Thống kê đóng phí suất ăn
                        </h2>

                        <div className="space-y-4">
                            <Progress label="Đã đóng phí" value={92} />
                            <Progress label="Đang chờ thu" value={5} />
                            <Progress label="Nợ quá hạn" value={3} danger />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({ title, value, sub, icon, color }) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm flex justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
                {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        paid: "Đã đóng",
        pending: "Chờ đối soát",
        debt: "Còn nợ",
    };

    const color = {
        paid: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        debt: "bg-red-100 text-red-700",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs ${color[status]}`}>
            {map[status]}
        </span>
    );
}

function Row({ code, name, reg, real, noshow, fee, status }) {
    return (
        <tr>
            <td>{code}</td>
            <td>{name}</td>
            <td>{reg}</td>
            <td>{real}</td>
            <td>{noshow}</td>
            <td>{fee}</td>
            <td><StatusBadge status={status} /></td>
        </tr>
    );
}

function Progress({ label, value, danger }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className={danger ? "text-red-600" : ""}>{value}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
                <div
                    className={`h-2 rounded-full ${danger ? "bg-red-500" : "bg-emerald-600"}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

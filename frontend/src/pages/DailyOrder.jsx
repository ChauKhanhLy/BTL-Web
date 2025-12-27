import { useEffect, useState } from "react";
import { fetchOrderStats } from "../services/orderService";
import {
    Users, Utensils, UserX, Wallet
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function OrdersPage() {
    const [range, setRange] = useState("week");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchOrderStats(range)
            .then(setData)
            .finally(() => setLoading(false));
    }, [range]);

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
    if (!data) return null;

    // 👉 UI CHỈ DÙNG DATA ĐÃ CHUẨN HÓA
    const { stats, chart, table } = data;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* FILTER */}
            <div className="flex mb-6 gap-2">
                {["day", "week", "month"].map((r) => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-4 py-2 rounded
                          ${range === r
                                ? "bg-emerald-600 text-white"
                                : "bg-white"
                            }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard title="NLD đăng ký" value={stats.reg} icon={<Users />} />
                <StatCard title="NLD thực tế" value={stats.real} icon={<Utensils />} />
                <StatCard title="No-show" value={stats.noshow} icon={<UserX />} />
                <StatCard
                    title="Đã đóng phí"
                    value={stats.paid}
                    sub={`${stats.debt} NLD còn nợ`}
                    icon={<Wallet />}
                />
            </div>

            {/* TABLE */}
            <table className="w-full bg-white rounded-xl">
                <tbody>
                    {table.map((row) => (
                        <Row key={row.code} {...row} />
                    ))}
                </tbody>
            </table>

            {/* CHART */}
            <div className="bg-white rounded-xl mt-6 p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="reg" name="Đăng ký" />
                        <Bar dataKey="real" name="Thực tế" />
                        <Bar dataKey="noshow" name="No-show" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

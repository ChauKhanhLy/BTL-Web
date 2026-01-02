import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
    Users, Utensils, UserX, Wallet, Search
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import StatCard from "../components/StatCard";
import orderService from "../services/orderService";

export default function OrdersPage() {
    /* ================= STATE ================= */
    const [range, setRange] = useState("week");
    const [selectedDate, setSelectedDate] = useState(
        dayjs().format("YYYY-MM-DD")
    );
    const [search, setSearch] = useState("");

    const [stats, setStats] = useState(null);
    const [chart, setChart] = useState([]);
    const [orders, setOrders] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ================= FETCH DASHBOARD ================= */
    useEffect(() => {
        loadDashboard();
    }, [range, selectedDate]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const res = await orderService.fetchDashboardData({
                range,
                date: selectedDate,
            });

            setStats(res.stats);
            setChart(res.chart);
            setOrders(res.orders);
        } catch (err) {
            console.error("Load dashboard failed", err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= DERIVED DATA ================= */

    const filteredOrders = orders.filter(o =>
        o.user_name?.toLowerCase().includes(search.toLowerCase())
    );

    const customerCosts = filteredOrders.reduce((acc, o) => {
        const found = acc.find(c => c.customer === o.user_name);
        if (found) {
            found.totalOrders += 1;
            found.totalAmount += o.price;
            o.paid
                ? (found.paidAmount += o.price)
                : (found.debtAmount += o.price);
        } else {
            acc.push({
                customer: o.user_name,
                totalOrders: 1,
                totalAmount: o.price,
                paidAmount: o.paid ? o.price : 0,
                debtAmount: o.paid ? 0 : o.price,
            });
        }
        return acc;
    }, []);

    /* ================= ACTION ================= */

    const handleConfirmPaid = async () => {
        if (!selectedOrder) return;

        try {
            await orderService.confirmPaid(selectedOrder.id);

            // optimistic update
            setOrders(prev =>
                prev.map(o =>
                    o.id === selectedOrder.id
                        ? { ...o, paid: true, status: "completed" }
                        : o
                )
            );

            setSelectedOrder(prev => ({
                ...prev,
                paid: true,
                status: "completed",
            }));
        } catch (err) {
            console.error("Confirm paid failed", err);
        }
    };

    /* ================= UI ================= */

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">

            {/* RANGE + DATE */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {["day", "week", "month"].map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 rounded
                ${range === r ? "bg-emerald-600 text-white" : "bg-white"}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                />
            </div>

            {/* STAT CARDS */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
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
            )}

            {/* SEARCH */}
            <div className="flex justify-end">
                <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="outline-none text-sm"
                    />
                </div>
            </div>

            {/* COST SUMMARY */}
            <div>
                <h2 className="text-lg font-semibold mb-2">
                    Thống kê chi phí theo khách hàng
                </h2>

                <div className="bg-white rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Khách hàng</th>
                                <th className="text-center">Số đơn</th>
                                <th className="text-center">Tổng tiền</th>
                                <th className="text-center">Đã trả</th>
                                <th className="text-center">Còn nợ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerCosts.map((c, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-4 py-3">{c.customer}</td>
                                    <td className="text-center">{c.totalOrders}</td>
                                    <td className="text-center">{c.totalAmount.toLocaleString()} đ</td>
                                    <td className="text-center">{c.paidAmount.toLocaleString()} đ</td>
                                    <td className="text-center">{c.debtAmount.toLocaleString()} đ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER TABLE */}
            <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>

            <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th>Khách hàng</th>
                            <th>Giá</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Ngày</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(o => (
                            <tr
                                key={o.id}
                                className="border-t hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                    setSelectedOrder(o);
                                    setOpenDetail(true);
                                }}
                            >
                                <td className="px-4 py-3">{o.id}</td>
                                <td>{o.user_name}</td>
                                <td>{o.price.toLocaleString()} đ</td>
                                <td>{o.paid ? "Đã trả" : "Chưa trả"}</td>
                                <td>{o.status}</td>
                                <td>{dayjs(o.date).format("DD/MM/YYYY")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CHART */}
            <div className="bg-white rounded-xl p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="reg" fill="#3b82f6" />
                        <Bar dataKey="real" fill="#22c55e" />
                        <Bar dataKey="noshow" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ORDER DETAIL MODAL */}
            {openDetail && selectedOrder && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-lg rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Chi tiết đơn hàng #{selectedOrder.id}
                        </h3>

                        <p>Khách hàng: {selectedOrder.user_name}</p>
                        <p>Giá: {selectedOrder.price.toLocaleString()} đ</p>
                        <p>Thanh toán: {selectedOrder.paid ? "Đã trả" : "Chưa trả"}</p>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setOpenDetail(false)}
                                className="px-4 py-2 bg-gray-100 rounded"
                            >
                                Đóng
                            </button>

                            {!selectedOrder.paid && (
                                <button
                                    onClick={handleConfirmPaid}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded"
                                >
                                    Xác nhận đã thanh toán
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-black/10 flex items-center justify-center">
                    <div className="bg-white px-6 py-3 rounded shadow">
                        Đang tải dữ liệu...
                    </div>
                </div>
            )}
        </div>
    );
}

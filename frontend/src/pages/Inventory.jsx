import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { getInventoryOverview } from "../services/inventoryService";
import PurchaseOrderModal from "../components/PurchaseOrderModal";

export default function InventoryPage() {
    /* ================= STATE ================= */
    const [filter, setFilter] = useState("all");
    const [poRange, setPoRange] = useState("week");
    const [openPODetail, setOpenPODetail] = useState(false);

    const [data, setData] = useState({
        stats: [],
        stock: [],
        suggestions: [],
        recentPOs: [],
    });
    const [selectedPO, setSelectedPO] = useState(null);

    /* ================= EFFECT ================= */
    useEffect(() => {
        loadData();
    }, [poRange]);

    /* ================= FUNCTIONS ================= */
    const loadData = async () => {
        const res = await getInventoryOverview({ range: poRange });
        setData(res);
    };

    const openCreatePO = () => {
        setSelectedPO(null);
        setOpenPODetail(true);
    };

    /* ================= FILTER LOGIC ================= */
    const filteredStock = data.stock.filter(item => {
        if (filter === "low") return item.stock > 0 && item.stock <= item.par;
        if (filter === "out") return item.stock <= 0;
        return true;
    });

    /* ================= RENDER ================= */
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Kho hàng</h1>
                    <p className="text-sm text-gray-500">
                        Tổng quan tồn kho
                    </p>
                </div>

                <button
                    onClick={openCreatePO}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
                >
                    Thêm phiếu nhập
                </button>
            </div>

            {/* ================= FILTER ================= */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                    <input
                        placeholder="Tìm kiếm mặt hàng..."
                        className="px-4 py-2 rounded-lg border text-sm w-64"
                    />

                    {["Tất cả", "Sắp hết", "Hết hàng"].map((f) => {
                        const key =
                            f === "Tất cả"
                                ? "all"
                                : f === "Sắp hết"
                                    ? "low"
                                    : "out";

                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(key)}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === key
                                    ? "bg-emerald-700 text-white"
                                    : "bg-gray-100"
                                    }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {data.stats.map((s) => (
                    <StatCard
                        key={s.title}
                        title={s.title}
                        value={s.value}
                        note={s.note}
                    />
                ))}
            </div>

            {/* ================= MAIN ================= */}
            <div className="grid grid-cols-3 gap-6">
                {/* ===== TỒN KHO ===== */}
                <section className="col-span-2 bg-white rounded-xl p-6 shadow">
                    <h3 className="font-semibold mb-4">
                        Tồn kho hiện tại
                    </h3>

                    {/* SCROLL CONTAINER */}
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-gray-500">
                                <tr>
                                    <th className="text-left py-2">
                                        Mặt hàng
                                    </th>
                                    <th className="text-center">Tồn kho</th>
                                    <th className="text-center">Định mức</th>
                                    <th className="text-center">Đã sử dụng</th>

                                </tr>
                            </thead>
                            <tbody>
                                {filteredStock.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t"
                                    >
                                        <td className="py-3">
                                            {item.name}
                                        </td>
                                        <td className="text-center">
                                            {item.stock}
                                        </td>
                                        <td className="text-center">
                                            {item.par}
                                        </td>
                                        <td className="text-center">
                                            {item.usedToday ?? 0}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ===== GỢI Ý ===== */}
                <section className="bg-white rounded-xl p-6 shadow">
                    <h3 className="font-semibold mb-4">
                        Gợi ý nhập hàng
                    </h3>

                    {data.suggestions.map((s) => (
                        <div
                            key={s.id}
                            className="flex justify-between items-center mb-3"
                        >
                            <span className="text-sm">{s.name}</span>
                            <button className="text-xs bg-green-100 px-3 py-1 rounded">
                                sắp hết cần bổ sung
                            </button>
                        </div>
                    ))}
                </section>
            </div>

            {/* ================= PHIẾU NHẬP ================= */}
            <section className="bg-white rounded-xl shadow overflow-hidden mt-8">

                {/* HEADER */}
                <div className="flex justify-between items-center p-6 pb-10 border-b">
                    <h3 className="font-semibold">
                        Phiếu nhập gần đây
                    </h3>

                    <div className="flex gap-2">
                        {[
                            { k: "day", label: "Ngày" },
                            { k: "week", label: "Tuần" },
                            { k: "month", label: "Tháng" },
                        ].map((r) => (
                            <button
                                key={r.k}
                                onClick={() => setPoRange(r.k)}
                                className={`px-3 py-1 rounded text-sm ${poRange === r.k
                                    ? "bg-emerald-700 text-white"
                                    : "bg-gray-100"
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABLE SCROLL */}
                <div className="max-h-[320px] overflow-y-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left py-2 px-4 sticky top-0 bg-white z-20">
                                    Mã PO
                                </th>
                                <th className="text-center py-2 px-4 sticky top-0 bg-white z-20">
                                    Ngày
                                </th>
                                <th className="text-center py-2 px-4 sticky top-0 bg-white z-20">
                                    Tổng tiền
                                </th>
                                <th className="text-center py-2 px-4 sticky top-0 bg-white z-20">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.recentPOs.map((po) => (
                                <tr
                                    key={po.id}
                                    onClick={() => {
                                        console.log("CLICK PO:", po);
                                        setSelectedPO(po);      // lưu PO được click
                                        setOpenPODetail(true);  // mở modal
                                    }}
                                    className="border-t cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="py-2 px-4 font-medium text-emerald-700">
                                        {po.code}
                                    </td>

                                    <td className="text-center py-2 px-4">
                                        {po.created_at
                                            ? new Date(po.created_at).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    <td className="text-center py-2 px-4">
                                        ₫{(po.total_price || 0).toLocaleString()}
                                    </td>

                                    <td className="text-center py-2 px-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${po.status === "COMPLETED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {po.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </section>

            {/* ================= MODAL PO ================= */}
            {openPODetail && (

                <PurchaseOrderModal
                    po={selectedPO}
                    onClose={() => {
                        setOpenPODetail(false);
                        setSelectedPO(null);
                    }}

                    onCompleted={loadData}
                />
            )}
        </div>
    );
}

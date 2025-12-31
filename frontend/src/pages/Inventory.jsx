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

    /* ================= EFFECT ================= */
    useEffect(() => {
        loadData();
    }, [poRange]);

    /* ================= FUNCTIONS ================= */
    const loadData = async () => {
        const res = await getInventoryOverview({ range: poRange });
        setData(res);
    };

    // 👉 Mở modal PO đã tồn tại
    const openPODetailModal = (po) => {
        setSelectedPO(po);
        setOpenPODetail(true);
    };

    // 👉 Tạo PO mới
    const openCreatePO = () => {
        setOpenPODetail(true);
    };


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

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 rounded-lg text-sm">
                        Xuất file
                    </button>
                    <button
                        onClick={openCreatePO}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
                    >
                        Thêm phiếu nhập
                    </button>
                </div>
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

                    <select className="px-4 py-2 rounded-lg border text-sm">
                        <option>Danh mục: Tất cả</option>
                    </select>
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
                {/* TỒN KHO */}
                <section className="col-span-2 bg-white rounded-xl p-6 shadow">
                    <h3 className="font-semibold mb-4">
                        Tồn kho hiện tại
                    </h3>

                    <table className="w-full text-sm">
                        <thead className="text-gray-500">
                            <tr>
                                <th className="text-left py-2">
                                    Mặt hàng
                                </th>
                                <th>Tồn kho</th>
                                <th>Định mức</th>
                                <th>Nhà cung cấp</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.stock.map((item) => (
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
                                        {item.supplier}
                                    </td>
                                    <td className="text-center">
                                        <button className="px-3 py-1 text-xs bg-green-100 rounded">
                                            Đặt thêm
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* GỢI Ý */}
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
                                Thêm vào PO
                            </button>
                        </div>
                    ))}
                </section>
            </div>

            {/* ================= PHIẾU NHẬP ================= */}
            <div className="mt-8">
                <section className="bg-white rounded-xl p-6 shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">
                            Phiếu nhập gần đây
                        </h3>

                        {/* RANGE FILTER */}
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

                    {data.recentPOs.length === 0 && (
                        <p className="text-sm text-gray-400">
                            Chưa có phiếu nhập
                        </p>
                    )}

                    {data.recentPOs.map((po) => (
                        <div
                            key={po.id}
                            onClick={() => openPODetailModal(po)}
                            className="flex justify-between items-center py-2 border-t cursor-pointer hover:bg-gray-50"
                        >
                            <p className="text-sm text-gray-600">
                                {po.code} • ₫{(po.total_price || 0).toLocaleString()} • {po.status}
                            </p>

                            <div className="flex gap-2">
                                <button className="text-xs px-2 py-1 bg-blue-100 rounded">
                                    Sửa
                                </button>
                                <button className="text-xs px-2 py-1 bg-red-100 rounded">
                                    Xoá
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* ================= MODAL PO ================= */}
            {openPODetail && (
                <PurchaseOrderModal
                    onClose={() => setOpenPODetail(false)}
                    onCompleted={loadData}
                />
            )}
        </div>
    );
}

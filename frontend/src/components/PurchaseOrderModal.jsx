import { useEffect, useState } from "react";
import {
    createPurchaseOrder,
    addItemToPO,
    completePurchaseOrder,
    fetchRawMaterials,
    createRawMaterial,
    getPurchaseOrderDetail,
} from "../services/inventoryService";

export default function PurchaseOrderModal({ po, onClose, onCompleted }) {
    /* ================= MODE ================= */
    const isViewMode = Boolean(po?.id); // true = xem PO cũ

    /* ================= TYPE ================= */
    const [type, setType] = useState(po?.type || "IN"); // IN | OUT
    const isOut = type === "OUT";

    /* ================= STATE ================= */
    const [materials, setMaterials] = useState([]);

    // item input
    const [rawmaterialId, setRawmaterialId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [supplier, setSupplier] = useState("");

    const [items, setItems] = useState([]);

    // create material
    const [showCreate, setShowCreate] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState("");
    const [newMaterialPar, setNewMaterialPar] = useState("");

    const [loading, setLoading] = useState(false);

    /* ================= EFFECT ================= */
    useEffect(() => {
        loadMaterials();
    }, []);

    useEffect(() => {
        if (!po) return;
        loadPODetail(po.id);
    }, [po]);

    const loadMaterials = async () => {
        const res = await fetchRawMaterials();
        setMaterials(res.data || res);
    };

    const loadPODetail = async (poId) => {
        try {
            const res = await getPurchaseOrderDetail(poId);
            setItems(res.items || []);
        } catch (err) {
            console.error(err);
            alert("Không load được chi tiết phiếu");
        }
    };

    /* ================= HANDLERS ================= */

    const handleAddItem = () => {
        if (!rawmaterialId || !quantity || (!isOut && !price)) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const material = materials.find(
            (m) => m.id === Number(rawmaterialId)
        );
        if (!material) return;

        setItems((prev) => [
            ...prev,
            {
                rawmaterialId: material.id,
                productName: material.name,
                quantity: Number(quantity),
                price: isOut ? 0 : Number(price),
                supplier: isOut ? null : supplier,
            },
        ]);

        setRawmaterialId("");
        setQuantity("");
        setPrice("");
        setSupplier("");
    };

    const handleRemoveItem = (index) => {
        if (isViewMode) return;
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCreateMaterial = async () => {
        if (!newMaterialName.trim()) return;

        const material = await createRawMaterial({
            name: newMaterialName,
            par: Number(newMaterialPar) || 0,
        });

        setMaterials((prev) => [...prev, material]);
        setRawmaterialId(material.id);
        setNewMaterialName("");
        setNewMaterialPar("");
        setShowCreate(false);
    };

    const totalPrice = items.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
    );

    const handleCompletePO = async () => {
        if (isViewMode) return;
        if (items.length === 0) {
            alert("Phiếu chưa có nguyên liệu");
            return;
        }

        try {
            setLoading(true);

            // 👉 TẠO PO (CÓ TYPE)
            const poRes = await createPurchaseOrder({ type });
            const poId = poRes.id;
            for (const item of items) {
                const payload =
                    type === "IN"
                        ? {
                            rawmaterialId: item.rawmaterialId,
                            quantity: item.quantity,
                            price: item.price,
                            supplier: item.supplier,
                        }
                        : {
                            rawmaterialId: item.rawmaterialId,
                            quantity: item.quantity,
                        };

                console.log("FE → payload gửi đi:", payload);

                await addItemToPO(poId, payload);
            }



            await completePurchaseOrder(poId);

            onCompleted();
            onClose();
        } catch (err) {
            console.error(err);
            alert(err.message || "Có lỗi khi xử lý phiếu");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[900px] p-6">
                {/* HEADER */}
                <div className="flex justify-between mb-3">
                    <h3
                        className={`font-semibold ${isOut ? "text-red-600" : "text-emerald-700"
                            }`}
                    >
                        {isViewMode
                            ? isOut
                                ? "Chi tiết phiếu xuất kho"
                                : "Chi tiết phiếu nhập kho"
                            : isOut
                                ? "Tạo phiếu xuất kho"
                                : "Tạo phiếu nhập kho"}
                    </h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* ===== CHỌN LOẠI PHIẾU ===== */}
                {!isViewMode && (
                    <div className="flex gap-6 mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={type === "IN"}
                                onChange={() => setType("IN")}
                            />
                            <span className="text-emerald-700 font-medium">
                                Nhập kho
                            </span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={type === "OUT"}
                                onChange={() => setType("OUT")}
                            />
                            <span className="text-red-600 font-medium">
                                Xuất kho
                            </span>
                        </label>
                    </div>
                )}

                {/* ===== FORM ADD ITEM ===== */}
                {!isViewMode && (
                    <>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            <select
                                value={rawmaterialId}
                                onChange={(e) => setRawmaterialId(e.target.value)}
                                className="px-3 py-2 border rounded text-sm"
                            >
                                <option value="">-- Nguyên liệu --</option>
                                {materials.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Số lượng"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="px-3 py-2 border rounded text-sm"
                            />

                            {!isOut && (
                                <>
                                    <input
                                        type="number"
                                        placeholder="Giá tiền"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="px-3 py-2 border rounded text-sm"
                                    />
                                    <input
                                        placeholder="Nhà cung cấp"
                                        value={supplier}
                                        onChange={(e) => setSupplier(e.target.value)}
                                        className="px-3 py-2 border rounded text-sm"
                                    />
                                </>
                            )}

                            <button
                                onClick={handleAddItem}
                                className={`text-white rounded px-4 ${isOut ? "bg-red-600" : "bg-emerald-600"
                                    }`}
                            >
                                Thêm
                            </button>
                        </div>

                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="text-sm text-blue-600 underline mb-3"
                        >
                            + Tạo nguyên liệu mới
                        </button>
                    </>
                )}

                {/* ===== CREATE MATERIAL ===== */}
                {!isViewMode && showCreate && (
                    <div className="border rounded-lg p-4 mb-4 bg-gray-50 w-1/2">
                        <input
                            value={newMaterialName}
                            onChange={(e) => setNewMaterialName(e.target.value)}
                            placeholder="Tên nguyên liệu"
                            className="w-full px-3 py-2 border rounded text-sm mb-2"
                        />
                        <input
                            type="number"
                            value={newMaterialPar}
                            onChange={(e) => setNewMaterialPar(e.target.value)}
                            placeholder="Định mức tồn"
                            className="w-full px-3 py-2 border rounded text-sm mb-2"
                        />
                        <button
                            onClick={handleCreateMaterial}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                        >
                            Tạo
                        </button>
                    </div>
                )}

                {/* ===== TABLE ===== */}
                <table className="w-full text-sm mb-4">
                    <thead className="text-gray-500">
                        <tr>
                            <th className="text-left">Nguyên liệu</th>
                            <th>Số lượng</th>
                            {!isOut && <th>Giá</th>}
                            {!isOut && <th>Nhà cung cấp</th>}
                            {!isOut && <th>Thành tiền</th>}
                            {!isViewMode && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((i, idx) => (
                            <tr key={idx} className="border-t">
                                <td className="py-2">{i.productName}</td>
                                <td className="text-center">{i.quantity}</td>
                                {!isOut && <td className="text-center">₫{i.price}</td>}
                                {!isOut && <td className="text-center">{i.supplier}</td>}
                                {!isOut && (
                                    <td className="text-center">
                                        ₫{(i.quantity * i.price).toLocaleString()}
                                    </td>
                                )}
                                {!isViewMode && (
                                    <td className="text-right">
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="text-xs bg-red-100 px-2 py-1 rounded"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTAL */}
                {!isOut && (
                    <div className="text-right font-semibold mb-4">
                        Tổng tiền: ₫{totalPrice.toLocaleString()}
                    </div>
                )}

                {/* FOOTER */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 rounded"
                    >
                        Đóng
                    </button>

                    {!isViewMode && (
                        <button
                            onClick={handleCompletePO}
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded ${isOut ? "bg-red-600" : "bg-orange-500"
                                }`}
                        >
                            {loading
                                ? "Đang xử lý..."
                                : isOut
                                    ? "Hoàn tất xuất kho"
                                    : "Hoàn tất nhập kho"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

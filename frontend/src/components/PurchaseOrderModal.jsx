import { useEffect, useState } from "react";
import {
    createPurchaseOrder,
    addItemToPO,
    completePurchaseOrder,
    fetchRawMaterials,
    createRawMaterial,
    getPurchaseOrderDetail,               // 👈 THÊM
} from "../services/inventoryService";

export default function PurchaseOrderModal({ po, onClose, onCompleted }) {
    /* ================= MODE ================= */
    const isViewMode = Boolean(po); // true = xem PO cũ

    /* ================= STATE ================= */
    const [materials, setMaterials] = useState([]);

    // item input (chỉ dùng khi tạo mới)
    const [rawmaterialId, setRawmaterialId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [supplier, setSupplier] = useState("");

    // items
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

    // 👉 LOAD PO DETAIL KHI XEM PO CŨ
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
            alert("Không load được chi tiết phiếu nhập");
        }
    };

    /* ================= HANDLERS ================= */

    // thêm item (CHỈ KHI TẠO MỚI)
    const handleAddItem = () => {
        if (!rawmaterialId || !quantity || !price || !supplier) {
            alert("Vui lòng nhập đầy đủ nguyên liệu, số lượng, giá và nhà cung cấp");
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
                price: Number(price),
                supplier,
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

    // 👉 CHỈ TẠO PO KHI CREATE MODE
    const handleCompletePO = async () => {
        if (isViewMode) return;

        if (items.length === 0) {
            alert("Phiếu nhập chưa có item");
            return;
        }

        try {
            setLoading(true);

            const po = await createPurchaseOrder();
            const poId = po.id;

            for (const item of items) {
                await addItemToPO(poId, {
                    rawmaterialId: item.rawmaterialId,
                    quantity: item.quantity,
                    price: item.price,
                    supplier: item.supplier,
                });
            }

            await completePurchaseOrder(poId);

            onCompleted();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Có lỗi khi tạo phiếu nhập");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[900px] p-6">
                {/* HEADER */}
                <div className="flex justify-between mb-4">
                    <h3 className="font-semibold">
                        {isViewMode ? "Chi tiết phiếu nhập" : "Tạo phiếu nhập"}
                    </h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* ===== FORM THÊM ITEM (CHỈ CREATE MODE) ===== */}
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

                            <button
                                onClick={handleAddItem}
                                className="bg-emerald-600 text-white rounded px-4"
                            >
                                Thêm
                            </button>
                        </div>

                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="text-sm text-blue-600 underline mb-3"
                        >
                            + Tạo loại nguyên liệu mới
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
                            placeholder="Định mức tồn kho"
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

                {/* ===== ITEMS TABLE ===== */}
                <table className="w-full text-sm mb-4">
                    <thead className="text-gray-500">
                        <tr>
                            <th className="text-left">Nguyên liệu</th>
                            <th>Số lượng</th>
                            <th>Giá</th>
                            <th>Nhà cung cấp</th>
                            <th>Thành tiền</th>
                            {!isViewMode && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((i, idx) => (
                            <tr key={idx} className="border-t">
                                <td className="py-2">{i.productName}</td>
                                <td className="text-center">{i.quantity}</td>
                                <td className="text-center">₫{i.price}</td>
                                <td className="text-center">{i.supplier}</td>
                                <td className="text-center">
                                    ₫{(i.quantity * i.price).toLocaleString()}
                                </td>
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
                <div className="text-right font-semibold mb-4">
                    Tổng tiền: ₫{totalPrice.toLocaleString()}
                </div>

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
                            className="px-4 py-2 bg-orange-500 text-white rounded"
                        >
                            {loading ? "Đang xử lý..." : "Hoàn tất PO"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

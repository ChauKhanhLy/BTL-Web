import React, { useEffect, useState } from "react";
import menuService from "../services/menuManagementService";

export default function UpdateFoodModal({
    dish,
    onClose,
    onUpdated,
}) {
    /* ===== FORM STATE ===== */
    const [name, setName] = useState(dish.name || "");
    const [description, setDescription] = useState(dish.description || "");
    const [price, setPrice] = useState(dish.price || "");
    const [ingredients, setIngredients] = useState(
        dish.ingredients ? dish.ingredients.join(", ") : ""
    );

    const [formCategoryId, setFormCategoryId] = useState(dish.categoryId || "");

    /* ===== DATA ===== */
    const [categories, setCategories] = useState([]);

    /* ===== UI STATE ===== */
    const [loading, setLoading] = useState(false);

    /* ================= LOAD CATEGORIES ================= */
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await menuService.getAllCategories();
                setCategories(data);
            } catch (err) {
                console.error("Load categories failed", err);
                alert("Không tải được danh mục");
            }
        };

        loadCategories();
    }, []);

    /* ================= UPDATE HANDLER ================= */
    const handleUpdate = async () => {
        if (!name || !price || !formCategoryId) {
            alert("Tên món, giá và danh mục là bắt buộc");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name,
                description,
                price: Number(price),
                categoryId: Number(formCategoryId),
                ingredients: ingredients
                    ? ingredients.split(",").map(i => i.trim())
                    : [],
            };

            const updated = await menuService.updateFood(dish.id, payload);

            // cập nhật UI cha
            onUpdated(updated);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px] p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Cập nhật món ăn
                </h2>

                {/* Tên món */}
                <div className="mb-3">
                    <label className="block text-sm mb-1">Tên món *</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Giá */}
                <div className="mb-3">
                    <label className="block text-sm mb-1">Giá *</label>
                    <input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                {/* Danh mục */}
                <div className="mb-3">
                    <label className="block text-sm mb-1">Danh mục *</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                    >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mô tả */}
                <div className="mb-3">
                    <label className="block text-sm mb-1">Mô tả</label>
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Nguyên liệu */}
                <div className="mb-4">
                    <label className="block text-sm mb-1">
                        Nguyên liệu (phân cách bằng dấu phẩy)
                    </label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 border rounded"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>

                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Cập nhật"}
                    </button>
                </div>
            </div>
        </div>
    );
}

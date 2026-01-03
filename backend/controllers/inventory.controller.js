import * as inventoryService from "../services/inventory.service.js";

/* ================= INVENTORY OVERVIEW ================= */

export const getInventoryOverview = async (req, res) => {
    try {
        const { range = "week" } = req.query;
        const data = await inventoryService.getInventoryOverview(range);
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Không lấy được tổng quan tồn kho",
        });
    }
};

/* ================= PURCHASE ORDER ================= */

export const createPurchaseOrder = async (req, res) => {
    try {
        const { type } = req.body;

        if (!["IN", "OUT"].includes(type)) {
            return res.status(400).json({
                message: "Type phải là IN hoặc OUT",
            });
        }

        const po = await inventoryService.createPurchaseOrder({ type });
        return res.status(201).json(po);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Không tạo được phiếu",
        });
    }
};

export const getPurchaseOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const po = await inventoryService.getPurchaseOrderDetail(id);
        return res.json(po);
    } catch (err) {
        if (err.message === "PO_NOT_FOUND") {
            return res.status(404).json({
                message: "Phiếu không tồn tại",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không lấy được chi tiết phiếu",
        });
    }
};

export const addItemToPO = async (req, res) => {
    try {
        const { id } = req.params;

        // 👇 parse payload MỀM – cho phép thiếu price/supplier (OUT)
        const {
            rawmaterialId,
            quantity,
            price = undefined,
            supplier = undefined,
        } = req.body;
        console.log("ADD ITEM BODY:", req.body);

        await inventoryService.addItemToPO(
            id,
            rawmaterialId,
            quantity,
            price,
            supplier
        );

        return res.json({
            message: "Đã thêm nguyên liệu vào phiếu",
        });
    } catch (err) {
        // 👇 map đúng lỗi nghiệp vụ
        if (
            err.message === "INVALID_PO_OR_MATERIAL" ||
            err.message === "INVALID_QUANTITY" ||
            err.message === "INVALID_PRICE" ||
            err.message === "SUPPLIER_REQUIRED" ||
            err.message === "PO_ALREADY_COMPLETED"
        ) {
            return res.status(400).json({
                message: err.message, // trả rõ để debug
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không thêm được nguyên liệu vào phiếu",
        });
    }
};

export const deleteItemFromPO = async (req, res) => {
    try {
        const { itemId } = req.params;
        await inventoryService.deleteItemFromPO(itemId);
        return res.json({
            message: "Đã xoá nguyên liệu khỏi phiếu",
        });
    } catch (err) {
        if (err.message === "ITEM_ID_REQUIRED") {
            return res.status(400).json({
                message: "Thiếu itemId",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không xoá được nguyên liệu khỏi phiếu",
        });
    }
};

export const completePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await inventoryService.completePurchaseOrder(id);
        return res.json({
            message: "Hoàn tất phiếu, tồn kho đã được cập nhật",
        });
    } catch (err) {
        if (err.message === "PO_ID_REQUIRED") {
            return res.status(400).json({
                message: "Thiếu id phiếu",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không hoàn tất được phiếu",
        });
    }
};

/* ================= RAW MATERIAL ================= */

export const getRawMaterials = async (req, res) => {
    try {
        const materials = await inventoryService.fetchRawMaterials();
        return res.json(materials);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Không lấy được danh sách nguyên liệu",
        });
    }
};

export const createRawMaterial = async (req, res) => {
    try {
        const material = await inventoryService.createRawMaterial(req.body);
        return res.status(201).json(material);
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            message: "Tạo nguyên liệu thất bại",
        });
    }
};

import * as inventoryService from "../services/inventory.service.js";

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

export const createPurchaseOrder = async (req, res) => {
    try {
        const po = await inventoryService.createPurchaseOrder();
        return res.status(201).json(po);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Không tạo được phiếu nhập",
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
                message: "Phiếu nhập không tồn tại",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không lấy được chi tiết phiếu nhập",
        });
    }
};

export const addItemToPO = async (req, res) => {
    try {
        const { id } = req.params;
        const { rawmaterialId, quantity, price, supplier } = req.body;

        await inventoryService.addItemToPO(
            id,
            rawmaterialId,
            quantity,
            price,
            supplier
        );

        return res.json({
            message: "Đã thêm nguyên liệu vào phiếu nhập",
        });
    } catch (err) {
        if (
            err.message === "INVALID_PO_OR_MATERIAL" ||
            err.message === "INVALID_QUANTITY" ||
            err.message === "INVALID_PRICE" ||
            err.message === "SUPPLIER_REQUIRED"
        ) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không thêm được nguyên liệu vào phiếu nhập",
        });
    }
};

export const deleteItemFromPO = async (req, res) => {
    try {
        const { itemId } = req.params;
        await inventoryService.deleteItemFromPO(itemId);
        return res.json({
            message: "Đã xoá nguyên liệu khỏi phiếu nhập",
        });
    } catch (err) {
        if (err.message === "ITEM_ID_REQUIRED") {
            return res.status(400).json({
                message: "Thiếu itemId",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không xoá được nguyên liệu khỏi phiếu nhập",
        });
    }
};

export const completePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await inventoryService.completePurchaseOrder(id);
        return res.json({
            message: "Hoàn tất phiếu nhập, tồn kho đã được cập nhật",
        });
    } catch (err) {
        if (err.message === "PO_ID_REQUIRED") {
            return res.status(400).json({
                message: "Thiếu id phiếu nhập",
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Không hoàn tất được phiếu nhập",
        });
    }
};

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

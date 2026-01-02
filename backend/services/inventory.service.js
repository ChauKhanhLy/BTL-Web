import * as inventoryDAL from "../dal/inventory.dal.js";

/* ================= INVENTORY OVERVIEW ================= */

export const getInventoryOverview = async (range = "week") => {
    const now = new Date();
    let fromDate = new Date(now);

    if (range === "day") {
        fromDate.setDate(now.getDate() - 1);
    } else if (range === "month") {
        fromDate.setMonth(now.getMonth() - 1);
    } else {
        fromDate.setDate(now.getDate() - 7);
    }

    const [
        stock,
        stats,
        importSum,
        suggestions,
        recentPOs,
    ] = await Promise.all([
        inventoryDAL.fetchStock(),
        inventoryDAL.fetchStats(),
        inventoryDAL.fetchImportSumByRange(fromDate.toISOString()),
        inventoryDAL.fetchSuggestions(),
        inventoryDAL.fetchRecentPOs(),
    ]);

    return {
        stats: [
            {
                title: "Sản phẩm theo dõi",
                value: Number(stats.total_products),
                note: "Tất cả nguyên liệu",
            },
            {
                title: "Mặt hàng dưới định mức",
                value: Number(stats.low_stock),
                note: "Cần nhập thêm",
            },
            {
                title: "Nhập gần đây",
                value: Number(importSum),
                note: range,
            },
        ],
        stock,
        suggestions,
        recentPOs,
    };
};

/* ================= PURCHASE ORDER ================= */

export const createPurchaseOrder = async () => {
    return inventoryDAL.createPurchaseOrder();
};

export const getPurchaseOrderDetail = async (poId) => {
    if (!poId) {
        throw new Error("PO_ID_REQUIRED");
    }

    const po = await inventoryDAL.getPurchaseOrderDetail(poId);

    if (!po) {
        throw new Error("PO_NOT_FOUND");
    }

    return po;
};

export const addItemToPO = async (
    poId,
    rawmaterialId,
    quantity,
    price,
    supplier
) => {
    if (!poId || !rawmaterialId) {
        throw new Error("INVALID_PO_OR_MATERIAL");
    }

    if (!quantity || quantity <= 0) {
        throw new Error("INVALID_QUANTITY");
    }

    if (!price || price <= 0) {
        throw new Error("INVALID_PRICE");
    }

    if (!supplier) {
        throw new Error("SUPPLIER_REQUIRED");
    }

    await inventoryDAL.addItemToPO(
        poId,
        rawmaterialId,
        quantity,
        price,
        supplier
    );

    return true;
};

export const deleteItemFromPO = async (itemId) => {
    if (!itemId) {
        throw new Error("ITEM_ID_REQUIRED");
    }

    await inventoryDAL.deleteItemFromPO(itemId);
    return true;
};

export const completePurchaseOrder = async (poId) => {
    if (!poId) {
        throw new Error("PO_ID_REQUIRED");
    }

    await inventoryDAL.completePurchaseOrder(poId);
    return true;
};

/* ================= RAW MATERIAL ================= */

export const fetchRawMaterials = async () => {
    return inventoryDAL.fetchRawMaterials();
};

export const createRawMaterial = async (payload) => {
    if (!payload?.name) {
        throw new Error("RAW_MATERIAL_NAME_REQUIRED");
    }

    return inventoryDAL.createRawMaterial({
        name: payload.name,
        par: Number(payload.par) || 0,
    });
};


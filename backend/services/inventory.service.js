import * as inventoryDAL from "../dal/inventory.dal.js";

/* ================= INVENTORY OVERVIEW ================= */

export const getInventoryOverview = async (range = "week") => {
    const now = new Date();
    const fromDate = new Date(now);
    const toDate = new Date(now);

    if (range === "day") {
        // hôm nay
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

    } else if (range === "week") {
        // tuần hiện tại: Thứ 2 → Thứ 6
        const day = now.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
        const mondayOffset = day === 0 ? -6 : 1 - day;

        fromDate.setDate(now.getDate() + mondayOffset);
        fromDate.setHours(0, 0, 0, 0);

        toDate.setDate(fromDate.getDate() + 4); // Thứ 6
        toDate.setHours(23, 59, 59, 999);

    } else if (range === "month") {
        // tháng hiện tại
        fromDate.setDate(1);
        fromDate.setHours(0, 0, 0, 0);

        toDate.setHours(23, 59, 59, 999);
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
        inventoryDAL.fetchImportSumByRange(
            fromDate.toISOString(),
            toDate.toISOString()
        ),
        inventoryDAL.fetchSuggestions(),
        inventoryDAL.fetchRecentPOs(
            fromDate.toISOString(),
            toDate.toISOString()
        ),
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


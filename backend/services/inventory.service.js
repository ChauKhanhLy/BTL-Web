import * as inventoryDAL from "../dal/inventory.dal.js";

/* ================= INVENTORY OVERVIEW ================= */

export const getInventoryOverview = async (range = "week") => {
    const now = new Date();
    const fromDate = new Date(now);
    const toDate = new Date(now);

    if (range === "day") {
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

    } else if (range === "week") {
        const day = now.getDay(); // 0 = CN
        const mondayOffset = day === 0 ? -6 : 1 - day;

        fromDate.setDate(now.getDate() + mondayOffset);
        fromDate.setHours(0, 0, 0, 0);

        toDate.setDate(fromDate.getDate() + 4);
        toDate.setHours(23, 59, 59, 999);

    } else if (range === "month") {
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

export const createPurchaseOrder = async ({ type }) => {
    if (!["IN", "OUT"].includes(type)) {
        throw new Error("Invalid purchase order type");
    }

    // status = IN | OUT
    return inventoryDAL.createPurchaseOrder({
        status: type,
    });
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
    console.log("🟡 SERVICE INPUT:", {
        poId,
        rawmaterialId,
        quantity,
        price,
        supplier,
    });

    if (!poId || !rawmaterialId) {
        console.error("❌ SERVICE FAIL: INVALID_PO_OR_MATERIAL (input)");
        throw new Error("INVALID_PO_OR_MATERIAL");
    }

    const po = await inventoryDAL.getPurchaseOrderDetail(poId);
    console.log("🟡 SERVICE PO:", po);

    if (!po) {
        console.error("❌ SERVICE FAIL: PO NOT FOUND");
        throw new Error("INVALID_PO_OR_MATERIAL");
    }

    if (po.completed_at) {
        console.error("❌ SERVICE FAIL: PO_ALREADY_COMPLETED");
        throw new Error("PO_ALREADY_COMPLETED");
    }

    if (!quantity || quantity <= 0) {
        console.error("❌ SERVICE FAIL: INVALID_QUANTITY");
        throw new Error("INVALID_QUANTITY");
    }

    console.log("🟡 SERVICE STATUS:", po.status);

    await inventoryDAL.addItemToPO(
        poId,
        rawmaterialId,
        quantity,
        price || 0,
        supplier || null
    );

    console.log("✅ SERVICE: addItemToPO SUCCESS");
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

    // 1️⃣ Lấy PO để biết IN / OUT
    const po = await inventoryDAL.getPurchaseOrderById(poId);
    if (!po) {
        throw new Error("PO_NOT_FOUND");
    }

    if (po.completed_at) {
        throw new Error("PO_ALREADY_COMPLETED");
    }

    if (!["IN", "OUT"].includes(po.status)) {
        throw new Error("INVALID_PO_STATUS");
    }

    // 2️⃣ Lấy items
    const items = await inventoryDAL.getPOItems(poId);

    if (!items || items.length === 0) {
        throw new Error("PO_EMPTY");
    }

    let totalPrice = 0;

    // 3️⃣ XỬ LÝ THU / CHI
    for (const item of items) {
        const quantity = Number(item.quantity);
        const price = Number(item.price || 0);

        totalPrice += quantity * price;

        const material = await inventoryDAL.getRawMaterialById(
            item.rawmaterial_id
        );

        if (!material) {
            throw new Error("RAW_MATERIAL_NOT_FOUND");
        }

        let newRemain = Number(material.remain);
        let newUsed = Number(material.quantity_used || 0);

        if (po.status === "IN") {
            // 🔵 NHẬP KHO (THU)
            newRemain += quantity;
        } else {
            // 🔴 XUẤT KHO (CHI)
            newRemain -= quantity;
            newUsed += quantity;

            if (newRemain < 0) {
                throw new Error("INSUFFICIENT_STOCK");
            }
        }

        await inventoryDAL.updateRawMaterial(
            item.rawmaterial_id,
            {
                remain: newRemain,
                quantity_used: newUsed,
            }
        );
    }

    // 4️⃣ Đánh dấu hoàn tất PO
    await inventoryDAL.completePurchaseOrder(
        poId,
        totalPrice
    );

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

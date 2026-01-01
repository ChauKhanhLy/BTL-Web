import * as inventoryApi from "../api/inventory.api";


export const getInventoryOverview = (params) => {
    return inventoryApi.fetchInventoryOverview(params);
};

export const createPurchaseOrder = () => {
    return inventoryApi.createPO();
};

export const getPurchaseOrderDetail = (poId) => {
    if (!poId) {
        return Promise.resolve({ items: [] });
    }
    return inventoryApi.getPODetail(poId);
};

export const addItemToPO = (poId, data) => {
    return inventoryApi.addPOItem(poId, data);
};

export const removeItemFromPO = (poId, itemId) => {
    return inventoryApi.deletePOItem(poId, itemId);
};

export const completePurchaseOrder = (poId) => {
    return inventoryApi.completePO(poId);
};

export const fetchRawMaterials = () => {
    return inventoryApi.fetchRawMaterials();
};

export const createRawMaterial = (data) => {
    return inventoryApi.createRawMaterial(data);
};

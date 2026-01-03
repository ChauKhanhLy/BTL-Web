import axiosClient from "../api/axiosClient";
import * as inventoryApi from "../api/inventory.api";

export const getPODetail = async (poId) => {
    const res = await axiosClient.get(
        `/inventory/purchase-orders/${poId}`
    );
    return res;
};

export const getInventoryOverview = (params) => {
    return inventoryApi.fetchInventoryOverview(params);
};

export const createPurchaseOrder = ({ type }) => {
    return inventoryApi.createPurchaseOrder({ type });
};

export const getPurchaseOrderDetail = (poId) => {
    if (!poId) {
        return Promise.resolve({ items: [] });
    }
    return inventoryApi.getPODetail(poId);
};

export const addItemToPO = (poId, payload) => {
    return inventoryApi.addPOItem(poId, payload);
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

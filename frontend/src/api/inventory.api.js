import axiosClient from "./axiosClient";

export const fetchInventoryOverview = (params) => {
    return axiosClient.get("/inventory/overview", { params });
};

export const createPO = () => {
    return axiosClient.post("/inventory/purchase-orders");
};

export const getPODetail = (id) => {
    if (!id) {
        return Promise.resolve({ items: [] });
    }
    return axiosClient.get(`/inventory/purchase-orders/${id}`);
};

export const addPOItem = (poId, payload) => {
    return axiosClient.post(
        `/inventory/purchase-orders/${poId}/items`,
        {
            rawmaterialId: payload.rawmaterialId,
            quantity: payload.quantity,
            price: payload.price,
            supplier: payload.supplier,
        }
    );
};

export const deletePOItem = (poId, itemId) => {
    return axiosClient.delete(
        `/inventory/purchase-orders/${poId}/items/${itemId}`
    );
};

export const completePO = (id) => {
    return axiosClient.post(
        `/inventory/purchase-orders/${id}/complete`
    );
};

export const fetchRawMaterials = () => {
    return axiosClient.get("/inventory/raw-materials");
};

export const createRawMaterial = (payload) => {
    return axiosClient.post(
        "/inventory/raw-materials",
        {
            name: payload.name,
        }
    );
};

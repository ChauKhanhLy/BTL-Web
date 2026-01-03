import axiosClient from "./axiosClient";

export const fetchInventoryOverview = (params) => {
    return axiosClient.get("/inventory/overview", { params });
};

export const createPurchaseOrder = async ({ type }) => {
    return axiosClient.post("/inventory/purchase-orders", { type });
};


export const getPODetail = (id) => {
    if (!id) {
        return Promise.resolve({ items: [] });
    }
    return axiosClient.get(`/inventory/purchase-orders/${id}`);
};

export const addPOItem = (poId, payload) => {
    console.log("API FE gửi body:", payload);

    return axiosClient.post(
        `/inventory/purchase-orders/${poId}/items`,
        payload
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
            par: payload.par ?? 0,
        }
    );
};

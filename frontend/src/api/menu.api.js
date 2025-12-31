import axiosClient from "./axiosClient";

/* ========= CATEGORY ========= */

export const fetchCategories = async () => {
    const res = await axiosClient.get("/food/categories");
    return res; // trả raw data từ BE
};

/* ========= FOOD ========= */

export const fetchFoods = async () => {
    const res = await axiosClient.get("/food");
    return res;
};

export const fetchFoodsByCategory = async (categoryId) => {
    const res = await axiosClient.get("/food", {
        params: { category: categoryId },
    });
    return res;
};

export const createFoodApi = async (payload) => {
    return axiosClient.post("/food", payload);
};

/* ========= MENU========= */

export const fetchMenuByDay = async (day) => {
    const res = await axiosClient.get("/menu", {
        params: { day },
    });
    return res;
};

export const addFoodToDayApi = async (day, foodId) => {
    return axiosClient.post("/menu/add", {
        day,
        food_id: foodId,
    });
};

export const removeFoodFromDayApi = async (day, foodId) => {
    return axiosClient.delete("/menu/remove", {
        data: { day, food_id: foodId },
    });
};
export const getPODetailAPI = async (poId) => {
    if (!poId) return null;

    const res = await axiosClient.get(
        `/inventory/purchase-orders/${poId}`
    );
    return res.data;
};
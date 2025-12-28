import axiosClient from "./axiosClient";

export const getRecentOrders = (user_id) =>
  axiosClient.get("/orders", { params: { user_id } });

export const getOrderStats = (range) =>
  axiosClient.get("/orders/stats", { params: { range } });

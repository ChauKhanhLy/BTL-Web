import axiosClient from "./axiosClient";

export const getRecentOrders = (user_id) =>
  axiosClient.get("/orders", { params: { user_id } });

export const getOrderStats = (range) =>
  axiosClient.get("/orders/stats", { params: { range } });

export const getOrders = (params) =>
  axiosClient.get("/orders", { params });

export const confirmOrderPaid = (orderId) =>
  axiosClient.put(`/orders/${orderId}/confirm-paid`);

export const getDashboard = ({ range, date }) =>
  axiosClient.get("/orders/dashboard", {
    params: { range, date },
  });

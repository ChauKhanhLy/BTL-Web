import axiosClient from "./axiosClient";

export const getAll = (params) =>
  axiosClient.get("/users", { params });

export const createUser = (payload) =>
  axiosClient.post("/users", payload);

export const deleteUser = (id) =>
  axiosClient.delete(`/users/${id}`);

export const updateStatus = (id, status) =>
  axiosClient.put(`/users/${id}/status`, { status });

export const sendInvite = (id) =>
  axiosClient.post(`/users/${id}/invite`);

export const getProfile = (id) => {
  return axiosClient.get(`/users/${id}`);
};
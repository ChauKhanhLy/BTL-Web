import axiosClient from "./axiosClient";

export const submitFeedback = (data) =>
  axiosClient.post("/feedback", data);

export const getMyFeedbacks = (user_id) =>
  axiosClient.get("/feedback/me", { params: { user_id } });

import axios from "axios";

const API_URL = "http://localhost:5000/api/feedback";

export const submitFeedback = (data) =>
  axios.post(API_URL, data);

export const getMyFeedbacks = (user_id) =>
  axios.get(`${API_URL}/me`, { params: { user_id } });

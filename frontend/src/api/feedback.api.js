import axios from "axios";

const API_URL = "http://localhost:5000/api/feedback";

export const submitFeedback = (data) =>
  axios.post(API_URL, data);

export const getMyFeedbacks = (user_id) =>
<<<<<<< Updated upstream
  axios.get(`${API_URL}/me`, { params: { user_id } });
=======
  axiosClient.get("/feedback/me", { params: { user_id } });

const feedbackApi = {
  getAll: (params) => {
    return axiosClient.get('/feedback', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/feedback/${id}`);
  },
  sendReply: (id, replyText) => {
    return axiosClient.post(`/feedback/${id}/reply`, { replyText });
  },
  markResolved: (id) => {
    return axiosClient.put(`/feedback/${id}/resolve`);
  }
};

export default feedbackApi;
>>>>>>> Stashed changes

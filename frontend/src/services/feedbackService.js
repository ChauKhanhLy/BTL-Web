import axiosClient from '../api/axiosClient';

const feedbackService = {
  // ✅ Get all feedbacks (lọc params rỗng)
  getAllFeedbacks: async (filters = {}) => {
    const params = {};

    if (filters.search && filters.search.trim() !== "") {
      params.search = filters.search.trim();
    }

    if (filters.user && filters.user.trim() !== "") {
      params.user = filters.user.trim();
    }

    return await axiosClient.get('/feedback', { params });
  },

  // Get a single feedback detail
  getFeedbackById: async (id) => {
    return await axiosClient.get(`/feedback/${id}`);
  },

  // Send a reply to a customer
  sendReply: async (id, replyText) => {
    return await axiosClient.post(`/feedback/${id}/reply`, { replyText });
  },

  // Mark as resolved
  markAsResolved: async (id) => {
    return await axiosClient.put(`/feedback/${id}/resolve`);
  }
};

export default feedbackService;

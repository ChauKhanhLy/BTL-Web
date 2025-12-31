import axiosClient from '../api/axiosClient';

const feedbackService = {
  // Get all feedbacks with optional search params
  getAllFeedbacks: async (params) => {
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
import axiosClient from "./axiosClient";

/*export const submitFeedback = (data) =>
  axiosClient.post("/feedback", data);

export const getMyFeedbacks = (user_id) =>
  axiosClient.get("/feedback/me", { params: { user_id } });*/
const API_URL = 'http://localhost:5000/api';

// Submit feedback
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_URL}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

// Get my feedbacks
export const getMyFeedbacks = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/user/recent`, {
  params: { user_id }
});

    return response.data;
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    throw error;
  }
};
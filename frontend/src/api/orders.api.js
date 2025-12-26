import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

export const getRecentOrders = (user_id) =>
  axios.get(API_URL, { params: { user_id } });

import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    throw error;
  }
);

export default axiosClient;

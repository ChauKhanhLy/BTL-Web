import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Log để debug
        console.error("API error:", error?.response || error);

        // Chuẩn hoá lỗi trả về
        return Promise.reject({
            status: error?.response?.status,
            message:
                error?.response?.data?.message ||
                error?.message ||
                "API Error",
            data: error?.response?.data,
        });
    }
);

export default axiosClient;

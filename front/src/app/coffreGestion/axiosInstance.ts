// src/utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/coffres", // رابط الـ API
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

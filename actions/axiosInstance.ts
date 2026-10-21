import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV == "production"
      ? "https://api.neverbe.lk/api/v1"
      : "http://localhost:8080/api/v1",
  headers: {},
});

// Bound catalog reads without cutting off order or payment submissions.
axiosInstance.interceptors.request.use((config) => {
  if ((config.method || "get").toLowerCase() === "get" && !config.timeout) {
    config.timeout = 10000;
  }
  return config;
});

export default axiosInstance;

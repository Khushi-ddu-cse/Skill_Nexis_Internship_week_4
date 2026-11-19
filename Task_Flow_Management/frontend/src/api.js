import axios from "axios";

// Axios instance for communicating with the backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Extract a readable error message from API errors
export const errorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong."
  );
};

export default api;

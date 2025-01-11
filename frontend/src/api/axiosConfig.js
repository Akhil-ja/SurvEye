import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest._retry) {
      sessionStorage.removeItem("authInfo");
      window.location.href = "/signin";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && error.response?.data?.shouldRefresh) {
      originalRequest._retry = true;

      try {
        await api.post("/api/auth/refresh-token");
        return api(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem("authInfo");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data?.shouldReLogin) {
      sessionStorage.removeItem("authInfo");
      window.location.href = "/signin";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      sessionStorage.removeItem("authInfo");

      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

const api = axios.create({
   baseURL: "http://localhost:8080/api",
  //  baseURL: "http:localhost:8080/api",
  headers: {
    "Content-Type": "application/json"
  }
});
 
// Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    // console.log("token "+token);
     const token = localStorage.getItem("primehub_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

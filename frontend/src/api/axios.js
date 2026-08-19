import axios from "axios";

const api = axios.create({
  baseURL: "https://quiz-platform-backend-99hi.onrender.com/api",
});

export default api;
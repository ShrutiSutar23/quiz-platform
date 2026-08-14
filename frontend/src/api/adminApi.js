import api from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAdminStats = () => api.get("/admin/stats", getAuthHeader());
export const getPopularQuizzes = () => api.get("/admin/popular-quizzes", getAuthHeader());
export const getRecentAttempts = () => api.get("/admin/recent-attempts", getAuthHeader());
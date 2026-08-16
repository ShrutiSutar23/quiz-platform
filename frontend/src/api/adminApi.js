import api from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAdminStats = () => api.get("/admin/stats", getAuthHeader());
export const getPopularQuizzes = () => api.get("/admin/popular-quizzes", getAuthHeader());
export const getRecentAttempts = () => api.get("/admin/recent-attempts", getAuthHeader());

export const getAllStudents = () => api.get("/admin/users", getAuthHeader());
export const updateUserStatus = (id, status) =>
  api.patch(`/admin/users/${id}/status`, { status }, getAuthHeader());
export const deleteUser = (id) => api.delete(`/admin/users/${id}`, getAuthHeader());
export const getLeaderboard = () => api.get("/admin/leaderboard");
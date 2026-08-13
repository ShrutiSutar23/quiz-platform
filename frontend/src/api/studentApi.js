import api from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const browseQuizzes = (params) => api.get("/quizzes", { params });
export const getQuizDetails = (id) => api.get(`/quizzes/${id}`);
export const getCategoriesList = () => api.get("/categories");

export const startQuizAttempt = (quizId) =>
  api.post(`/attempts/start/${quizId}`, {}, getAuthHeader());

export const submitQuizAttempt = (attemptId, answers) =>
  api.post(`/attempts/submit/${attemptId}`, { answers }, getAuthHeader());

export const getAttemptResult = (attemptId) =>
  api.get(`/attempts/${attemptId}`, getAuthHeader());

export const getMyAttempts = () => api.get("/attempts", getAuthHeader());

export const getStudentStats = () => api.get("/attempts/stats/summary", getAuthHeader());
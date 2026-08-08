import api from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAllQuizzesAdmin = () =>
  api.get("/quizzes/admin/all", getAuthHeader());

export const createQuiz = (data) =>
  api.post("/quizzes", data, getAuthHeader());

export const updateQuiz = (id, data) =>
  api.put(`/quizzes/${id}`, data, getAuthHeader());

export const deleteQuiz = (id) =>
  api.delete(`/quizzes/${id}`, getAuthHeader());

export const publishQuiz = (id, status) =>
  api.patch(`/quizzes/${id}/publish`, { status }, getAuthHeader());

export const getCategories = () => api.get("/categories");

export const createCategory = (data) =>
  api.post("/categories", data, getAuthHeader());
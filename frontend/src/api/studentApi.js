import api from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const browseQuizzes = (params) => api.get("/quizzes", { params });

export const getQuizDetails = (id) => api.get(`/quizzes/${id}`);

export const getCategoriesList = () => api.get("/categories");
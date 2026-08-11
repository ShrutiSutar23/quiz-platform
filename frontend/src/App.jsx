import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ManageQuizzes from "./pages/ManageQuizzes";
import CreateQuiz from "./pages/CreateQuiz";
import ManageQuestions from "./pages/ManageQuestions";
import ManageCategories from "./pages/ManageCategories";
import BrowseQuizzes from "./pages/BrowseQuizzes";
import QuizDetails from "./pages/QuizDetails";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/admin/quizzes" element={<ManageQuizzes />} />
        <Route path="/admin/quizzes/create" element={<CreateQuiz />} />
        <Route path="/admin/quizzes/:quizId/questions" element={<ManageQuestions />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/student/quizzes" element={<BrowseQuizzes />} />
        <Route path="/student/quizzes/:id" element={<QuizDetails />} />
        <Route path="/student/quizzes/:id/attempt" element={<QuizAttempt />} />
        <Route path="/student/results/:attemptId" element={<QuizResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
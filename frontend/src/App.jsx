import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ManageQuizzes from "./pages/ManageQuizzes";
import CreateQuiz from "./pages/CreateQuiz";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
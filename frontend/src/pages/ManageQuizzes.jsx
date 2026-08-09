import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllQuizzesAdmin, deleteQuiz, publishQuiz } from "../api/quizApi";

function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");

  const loadQuizzes = () => {
    getAllQuizzesAdmin()
      .then((res) => setQuizzes(res.data))
      .catch((err) => setError("Failed to load quizzes"));
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteQuiz(id);
      loadQuizzes();
    } catch (err) {
      alert("Failed to delete quiz");
    }
  };

  const handleTogglePublish = async (quiz) => {
    const newStatus = quiz.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    try {
      await publishQuiz(quiz.id, newStatus);
      loadQuizzes();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Quizzes</h2>
          <div className="flex gap-3">
            <Link
              to="/admin/dashboard"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/admin/quizzes/create"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create Quiz
            </Link>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{quiz.title}</td>
                  <td className="p-3">{quiz.category?.name}</td>
                  <td className="p-3">{quiz.difficulty}</td>
                  <td className="p-3">{quiz.duration} min</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        quiz.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <Link
                      to={`/admin/quizzes/${quiz.id}/questions`}
                      className="text-purple-600 hover:underline text-sm"
                    >
                      Questions
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(quiz)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {quiz.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No quizzes yet. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageQuizzes;
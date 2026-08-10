import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getQuizDetails } from "../api/studentApi";

function QuizDetails() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getQuizDetails(id)
      .then((res) => setQuiz(res.data))
      .catch(() => setError("Quiz not found"));
  }, [id]);

  const handleStartQuiz = () => {
    navigate(`/student/quizzes/${id}/attempt`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/student/quizzes"
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Quizzes
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {quiz.category?.name}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{quiz.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Difficulty</p>
              <p className="font-semibold">{quiz.difficulty}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-semibold">{quiz.duration} minutes</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Passing Score</p>
              <p className="font-semibold">{quiz.passingScore}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Max Attempts</p>
              <p className="font-semibold">{quiz.maxAttempts}</p>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizDetails;
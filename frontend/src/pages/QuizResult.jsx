import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAttemptResult } from "../api/studentApi";

function QuizResult() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    getAttemptResult(attemptId)
      .then((res) => setAttempt(res.data))
      .catch(() => setError("Could not load result"));
  }, [attemptId]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading result...</p>
      </div>
    );
  }

  const isPassed = attempt.status === "PASSED";

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Result Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <p className="text-gray-500 mb-1">{attempt.quiz.title}</p>
          <h2 className="text-4xl font-bold mb-2">
            {Math.round(attempt.percentage)}%
          </h2>
          <span
            className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
              isPassed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {attempt.status}
          </span>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-3 rounded">
              <p className="text-2xl font-bold text-green-600">
                {attempt.correctAnswers}
              </p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-2xl font-bold text-red-600">
                {attempt.incorrectAnswers}
              </p>
              <p className="text-xs text-gray-500">Incorrect</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-2xl font-bold text-gray-600">
                {attempt.unanswered}
              </p>
              <p className="text-xs text-gray-500">Unanswered</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Time taken: {formatTime(attempt.timeTaken)}
          </p>

          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => setShowReview(!showReview)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showReview ? "Hide Review" : "Review Answers"}
            </button>
            <Link
              to="/student/quizzes"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>

        {/* Answer Review */}
        {showReview && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Answer Review</h3>
            {attempt.answers.map((ans, idx) => (
              <div key={ans.id} className="border-b py-4 last:border-b-0">
                <p className="font-medium mb-2">
                  {idx + 1}. {ans.question.questionText}
                </p>
                <ul className="ml-4 space-y-1">
                  {ans.question.options.map((opt) => {
                    const isSelected = ans.selectedOptionId === opt.id;
                    const isCorrectOption = opt.isCorrect;

                    let style = "text-gray-600";
                    if (isCorrectOption) style = "text-green-600 font-medium";
                    else if (isSelected && !isCorrectOption)
                      style = "text-red-600 font-medium";

                    return (
                      <li key={opt.id} className={`text-sm ${style}`}>
                        {isCorrectOption ? "✓" : isSelected ? "✗" : "○"}{" "}
                        {opt.optionText}
                        {isSelected && " (your answer)"}
                      </li>
                    );
                  })}
                </ul>
                {ans.question.explanation && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    💡 {ans.question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizResult;
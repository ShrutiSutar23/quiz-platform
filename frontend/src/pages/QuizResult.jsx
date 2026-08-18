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

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " at " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
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
  const totalQuestions = attempt.answers.length;

  const correctPct = (attempt.correctAnswers / totalQuestions) * 100;
  const incorrectPct = (attempt.incorrectAnswers / totalQuestions) * 100;
  const unansweredPct = (attempt.unanswered / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{attempt.quiz.title}</h2>
          <p className="text-sm text-gray-500">{attempt.quiz.description}</p>
        </div>

        {/* Status Banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${
            isPassed
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <span
            className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm ${
              isPassed ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isPassed ? "✓" : "✗"}
          </span>
          <div>
            <p
              className={`font-semibold ${
                isPassed ? "text-green-700" : "text-red-700"
              }`}
            >
              {isPassed ? "Quiz Passed" : "Quiz Failed"}
            </p>
            <p className="text-sm text-gray-600">
              Your submission has been recorded and scored automatically.
            </p>
          </div>
        </div>

        {/* Two-column card: Quiz Details (left) | Submission Overview (right) */}
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* LEFT: Quiz Details */}
            <div className="p-6 flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wide uppercase">
                📄 Quiz Details
              </h3>
              <div className="space-y-3 text-sm flex-1">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500">Total Questions</span>
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold">
                    {attempt.quiz.duration} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500">Passing Score</span>
                  <span className="font-semibold">
                    {attempt.quiz.passingScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500">Time Taken</span>
                  <span className="font-semibold">
                    {formatTime(attempt.timeTaken)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Difficulty</span>
                  <span className="font-semibold">
                    {attempt.quiz.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Submission Overview */}
            <div className="p-6 flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wide uppercase">
                🕐 Submission Overview
              </h3>

              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-5">
                  <p className="text-5xl font-bold">
                    {Math.round(attempt.percentage)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Score: {attempt.score} marks
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-green-700">
                      {attempt.correctAnswers}
                    </p>
                    <p className="text-[10px] text-green-600 font-semibold uppercase mt-1">
                      Correct
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-red-700">
                      {attempt.incorrectAnswers}
                    </p>
                    <p className="text-[10px] text-red-600 font-semibold uppercase mt-1">
                      Incorrect
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-600">
                      {attempt.unanswered}
                    </p>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1">
                      Skipped
                    </p>
                  </div>
                </div>

                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-200">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${correctPct}%` }}
                  />
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${incorrectPct}%` }}
                  />
                  <div
                    className="bg-gray-300 h-full"
                    style={{ width: `${unansweredPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with submitted time + review button */}
        <div className="bg-gray-50 border rounded-lg p-4 flex flex-wrap justify-between items-center gap-3 mb-6">
          <p className="text-sm text-gray-500">
            ☁ Submitted on {formatDateTime(attempt.completedAt)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReview(!showReview)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium flex items-center gap-1"
            >
              👁 {showReview ? "Hide Review" : "Review"}
            </button>
            <Link
              to="/student/quizzes"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm font-medium"
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
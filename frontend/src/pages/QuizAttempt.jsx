import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startQuizAttempt, submitQuizAttempt } from "../api/studentApi";

function QuizAttempt() {
  const { id } = useParams(); // quiz id from URL
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionId }
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submittedRef = useRef(false); // prevents double-submit

  // Load quiz + create attempt
  useEffect(() => {
    startQuizAttempt(id)
      .then((res) => {
        setAttemptId(res.data.attemptId);
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.quiz.duration * 60); // convert minutes to seconds
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not start quiz");
        setLoading(false);
      });
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || submittedRef.current) return;

    if (timeLeft <= 0) {
      handleSubmit(true); // auto-submit when time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submittedRef.current) return; // guard against double-submit
    if (!isAutoSubmit) {
      const unanswered = questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        const confirmSubmit = window.confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        );
        if (!confirmSubmit) return;
      }
    }

    submittedRef.current = true;
    setSubmitting(true);

    const answersArray = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id] || null,
    }));

    try {
      await submitQuizAttempt(attemptId, answersArray);
      navigate(`/student/results/${attemptId}`);
    } catch (err) {
      setError("Failed to submit quiz. Please try again.");
      submittedRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Starting quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/student/quizzes")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with timer */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">{quiz.title}</h2>
          <div
            className={`font-mono text-lg font-bold px-3 py-1 rounded ${
              timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question navigator dots */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-full text-sm font-medium ${
                  idx === currentIndex
                    ? "bg-blue-600 text-white"
                    : answers[q.id]
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {answeredCount} of {questions.length} answered
          </p>
        </div>

        {/* Current question */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <h3 className="text-lg font-semibold mb-4">
            {currentQuestion.questionText}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                  answers[currentQuestion.id] === opt.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] === opt.id}
                  onChange={() => handleSelectOption(currentQuestion.id, opt.id)}
                />
                <span>{opt.optionText}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-40"
          >
            ← Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizAttempt;
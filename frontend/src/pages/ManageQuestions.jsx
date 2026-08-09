import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuestions, createQuestion, deleteQuestion } from "../api/quizApi";

function ManageQuestions() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);

  const loadQuestions = () => {
    getQuestions(quizId)
      .then((res) => setQuestions(res.data))
      .catch(() => setError("Failed to load questions"));
  };

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const handleOptionTextChange = (index, value) => {
    const updated = [...options];
    updated[index].optionText = value;
    setOptions(updated);
  };

  const handleCorrectChange = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const resetForm = () => {
    setQuestionText("");
    setMarks(1);
    setExplanation("");
    setOptions([
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const filledOptions = options.filter((opt) => opt.optionText.trim() !== "");
    if (filledOptions.length < 2) {
      setError("Please fill at least 2 options");
      return;
    }
    if (!filledOptions.some((opt) => opt.isCorrect)) {
      setError("Please mark one option as correct");
      return;
    }

    try {
      await createQuestion({
        quizId: parseInt(quizId),
        questionText,
        marks,
        explanation,
        options: filledOptions,
      });
      setSuccess("Question added!");
      resetForm();
      loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      loadQuestions();
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Questions</h2>
          <Link
            to="/admin/quizzes"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Quizzes
          </Link>
        </div>

        {/* Add Question Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Add New Question</h3>

          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>
          )}
          {success && (
            <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full border p-2 rounded"
                rows="2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marks</label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Explanation (optional)
                </label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Options (select the radio button next to the correct answer)
              </label>
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => handleCorrectChange(index)}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={opt.optionText}
                    onChange={(e) => handleOptionTextChange(index, e.target.value)}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add Question
            </button>
          </form>
        </div>

        {/* Existing Questions List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Existing Questions ({questions.length})
          </h3>
          {questions.length === 0 && (
            <p className="text-gray-500">No questions added yet.</p>
          )}
          {questions.map((q, idx) => (
            <div key={q.id} className="border-b py-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <p className="font-medium">
                  {idx + 1}. {q.questionText}
                </p>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-red-600 hover:underline text-sm ml-4"
                >
                  Delete
                </button>
              </div>
              <ul className="mt-2 ml-4 text-sm">
                {q.options.map((opt) => (
                  <li
                    key={opt.id}
                    className={opt.isCorrect ? "text-green-600 font-medium" : "text-gray-600"}
                  >
                    {opt.isCorrect ? "✓" : "○"} {opt.optionText}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageQuestions;
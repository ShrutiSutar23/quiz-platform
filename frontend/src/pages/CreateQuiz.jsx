import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz, getCategories, createCategory } from "../api/quizApi";

function CreateQuiz() {
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    difficulty: "Beginner",
    duration: "",
    passingScore: 60,
    maxAttempts: 1,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const loadCategories = () => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "categoryId" && value === "OTHER") {
      setShowNewCategory(true);
      setForm({ ...form, categoryId: "" });
      return;
    }

    setShowNewCategory(false);
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let finalCategoryId = form.categoryId;

      // If admin typed a new category, create it first
      if (showNewCategory) {
        if (!newCategoryName.trim()) {
          setError("Please enter a category name");
          return;
        }
        const catRes = await createCategory({ name: newCategoryName.trim() });
        finalCategoryId = catRes.data.id;
      }

      if (!finalCategoryId) {
        setError("Please select or add a category");
        return;
      }

      await createQuiz({ ...form, categoryId: finalCategoryId });
      setSuccess("Quiz created successfully!");
      setTimeout(() => navigate("/admin/quizzes"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="categoryId"
              value={showNewCategory ? "OTHER" : form.categoryId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required={!showNewCategory}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="OTHER">+ Other (add new category)</option>
            </select>

            {showNewCategory && (
              <input
                type="text"
                placeholder="Type new category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full border p-2 rounded mt-2"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Passing %
              </label>
              <input
                type="number"
                name="passingScore"
                value={form.passingScore}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                name="maxAttempts"
                value={form.maxAttempts}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Quiz
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateQuiz;
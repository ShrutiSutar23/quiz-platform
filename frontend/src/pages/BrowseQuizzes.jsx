import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { browseQuizzes, getCategoriesList } from "../api/studentApi";

function BrowseQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);

  const loadQuizzes = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    if (difficulty) params.difficulty = difficulty;

    browseQuizzes(params)
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getCategoriesList().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      loadQuizzes();
    }, 300); // small delay so it doesn't search on every keystroke instantly
    return () => clearTimeout(delay);
  }, [search, categoryId, difficulty]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Available Quizzes</h2>
          <Link
            to="/student/dashboard"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search quiz title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded flex-1 min-w-[200px]"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Quiz Cards */}
        {loading && <p className="text-gray-500">Loading quizzes...</p>}

        {!loading && quizzes.length === 0 && (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow-md text-center">
            No quizzes found. Try adjusting your search or filters.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/student/quizzes/${quiz.id}`}
              className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{quiz.title}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {quiz.category?.name}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {quiz.description}
              </p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{quiz.difficulty}</span>
                <span>{quiz.duration} min</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BrowseQuizzes;
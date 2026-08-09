import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories, createCategory } from "../api/quizApi";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = () => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setError("Failed to load categories"));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createCategory({ name, description });
      setSuccess("Category added!");
      setName("");
      setDescription("");
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Categories</h2>
          <Link
            to="/admin/dashboard"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Category</h3>

          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>
          )}
          {success && (
            <p className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="e.g. React, Node.js, Database"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add Category
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            Existing Categories ({categories.length})
          </h3>
          <ul className="divide-y">
            {categories.map((cat) => (
              <li key={cat.id} className="py-2">
                <span className="font-medium">{cat.name}</span>
                {cat.description && (
                  <span className="text-gray-500 text-sm"> — {cat.description}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ManageCategories;
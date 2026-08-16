import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllStudents, updateUserStatus, deleteUser } from "../api/adminApi";

function ManageUsers() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = () => {
    getAllStudents()
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(student.id, newStatus);
      loadStudents();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student account? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      loadStudents();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <Link to="/admin/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Attempts</th>
                <th className="p-3">Avg Score</th>
                <th className="p-3">Highest</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.totalAttempts}</td>
                  <td className="p-3">{s.avgScore}%</td>
                  <td className="p-3">{s.highestScore}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        s.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No students registered yet.
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

export default ManageUsers;
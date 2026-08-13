import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyAttempts } from "../api/studentApi";

function AttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAttempts()
      .then((res) => setAttempts(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Attempt History</h2>
          <Link to="/student/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && attempts.length === 0 && (
          <p className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No attempts yet.
          </p>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">Quiz</th>
                <th className="p-3">Date</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.quiz.title}</td>
                  <td className="p-3">{new Date(a.completedAt).toLocaleDateString()}</td>
                  <td className="p-3">{Math.round(a.percentage)}%</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        a.status === "PASSED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/student/results/${a.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttemptHistory;
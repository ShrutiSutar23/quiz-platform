import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getAdminStats, getPopularQuizzes, getRecentAttempts } from "../api/adminApi";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState(null);
  const [popularQuizzes, setPopularQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    getAdminStats().then((res) => setStats(res.data));
    getPopularQuizzes().then((res) => setPopularQuizzes(res.data));
    getRecentAttempts().then((res) => setRecentAttempts(res.data));
  }, []);

  const pieData = stats
    ? [
        { name: "Passed", value: stats.totalPassed },
        { name: "Failed", value: stats.totalFailed },
      ]
    : [];
  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>

        <p className="text-lg mb-1">Welcome, {user?.name}</p>
        <p className="text-gray-600 mb-6">Role: {user?.role}</p>

        <div className="flex gap-3 mb-8 flex-wrap">
          <a href="/admin/quizzes" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
            Manage Quizzes
          </a>
          <a href="/admin/users" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block">
            Manage Users
          </a>
          <a href="/leaderboard" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 inline-block">
            Leaderboard
          </a>
        </div>

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-indigo-600">{stats.totalQuizzes}</p>
              <p className="text-xs text-gray-500">Total Quizzes</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-green-600">{stats.publishedQuizzes}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.draftQuizzes}</p>
              <p className="text-xs text-gray-500">Drafts</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.totalQuestions}</p>
              <p className="text-xs text-gray-500">Total Questions</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</p>
              <p className="text-xs text-gray-500">Total Attempts</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.totalAttempts > 0
                  ? Math.round((stats.totalPassed / stats.totalAttempts) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500">Pass Rate</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pass/Fail Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Pass / Fail Ratio</h3>
            {stats && stats.totalAttempts > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-10">No attempts yet</p>
            )}
          </div>

          {/* Popular Quizzes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Most Popular Quizzes</h3>
            <ul className="divide-y">
              {popularQuizzes.map((q) => (
                <li key={q.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{q.title}</p>
                    <p className="text-xs text-gray-500">{q.category}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                    {q.attemptCount} attempts
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Attempts (All Students)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-2">Student</th>
                  <th className="p-2">Quiz</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{a.user.name}</td>
                    <td className="p-2">{a.quiz.title}</td>
                    <td className="p-2">{Math.round(a.percentage)}%</td>
                    <td className="p-2">
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
                    <td className="p-2">{new Date(a.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
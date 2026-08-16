import { useState, useEffect } from "react";
import { getStudentStats, getMyAttempts } from "../api/studentApi";

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    getStudentStats().then((res) => setStats(res.data));
    getMyAttempts().then((res) => setRecentAttempts(res.data.slice(0, 5)));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Logout
          </button>
        </div>

        <p className="text-lg mb-1">Welcome, {user?.name}</p>
        <p className="text-gray-600 mb-6">Role: {user?.role}</p>

        <div className="flex gap-3 mb-8">
          <a href="/student/quizzes" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
            Browse Quizzes
          </a>
          <a href="/student/history" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block">
            Attempt History
          </a>
          <a href="/leaderboard" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 inline-block">
            Leaderboard
          </a>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalAttempted}</p>
              <p className="text-xs text-gray-500">Quizzes Attempted</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-green-600">{stats.totalPassed}</p>
              <p className="text-xs text-gray-500">Passed</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-red-600">{stats.totalFailed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.highestScore}%</p>
              <p className="text-xs text-gray-500">Highest Score</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.totalQuestionsAnswered}</p>
              <p className="text-xs text-gray-500">Questions Answered</p>
            </div>
          </div>
        )}

        {/* Recent Attempts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Attempts</h3>
          {recentAttempts.length === 0 ? (
            <p className="text-gray-500">No attempts yet. Take your first quiz!</p>
          ) : (
            <ul className="divide-y">
              {recentAttempts.map((a) => (
                <li key={a.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{a.quiz.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      a.status === "PASSED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {Math.round(a.percentage)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
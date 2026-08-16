import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard } from "../api/adminApi";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    getLeaderboard()
      .then((res) => setLeaderboard(res.data))
      .finally(() => setLoading(false));
  }, []);

  const backLink = user?.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard";

  const medalEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
          <Link to={backLink} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && leaderboard.length === 0 && (
          <p className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No attempts yet. Be the first to take a quiz!
          </p>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {leaderboard.map((entry, idx) => {
            const rank = idx + 1;
            const isCurrentUser = user?.id === entry.id;
            return (
              <div
                key={entry.id}
                className={`flex justify-between items-center p-4 border-b last:border-b-0 ${
                  isCurrentUser ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold w-8 text-center">
                    {medalEmoji(rank) || `#${rank}`}
                  </span>
                  <div>
                    <p className="font-medium">
                      {entry.name} {isCurrentUser && "(You)"}
                    </p>
                    <p className="text-xs text-gray-500">{entry.totalAttempts} quizzes taken</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600">{entry.avgScore}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
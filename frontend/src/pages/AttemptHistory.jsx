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

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " at " + d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Exam History</h2>
          <Link to="/student/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to Dashboard
          </Link>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && attempts.length === 0 && (
          <p className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No attempts yet. Take your first quiz!
          </p>
        )}

        <div className="space-y-4">
          {attempts.map((a) => {
            const isPassed = a.status === "PASSED";
            return (
              <Link
                key={a.id}
                to={`/student/results/${a.id}`}
                className="block bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{a.quiz.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ☁ Submitted on {formatDateTime(a.completedAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isPassed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="text-2xl font-bold">{Math.round(a.percentage)}%</span>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="text-green-600 font-medium">✓ {a.correctAnswers} correct</span>
                    <span className="text-red-600 font-medium">✗ {a.incorrectAnswers} incorrect</span>
                    <span className="text-gray-400 font-medium">○ {a.unanswered} skipped</span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-200">
                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width: `${(a.correctAnswers / (a.correctAnswers + a.incorrectAnswers + a.unanswered)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 h-full"
                    style={{
                      width: `${(a.incorrectAnswers / (a.correctAnswers + a.incorrectAnswers + a.unanswered)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-gray-300 h-full"
                    style={{
                      width: `${(a.unanswered / (a.correctAnswers + a.incorrectAnswers + a.unanswered)) * 100}%`,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AttemptHistory;
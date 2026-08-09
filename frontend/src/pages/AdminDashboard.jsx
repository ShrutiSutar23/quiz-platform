function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Logout
        </button>
      </div>
      <p className="text-lg">Welcome, {user?.name}</p>
      <p className="text-gray-600">Role: {user?.role}</p>
      <div className="mt-6">
        <a href="/admin/quizzes" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block">
            Manage Quizzes
        </a>
        <a href="/admin/categories" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block">
            Manage Categories
        </a>
      </div>
    </div>
  );
}

export default AdminDashboard;
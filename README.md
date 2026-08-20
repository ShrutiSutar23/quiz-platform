Quiz Management & Online Assessment Platform

A full-stack web application for creating, managing, and taking online quizzes — built with role-based access control, backend-validated scoring, and a live countdown timer.

The platform has two roles:

Admin — creates and manages quizzes, questions, categories, and students; views analytics and results.
Student — browses quizzes, attempts them within a time limit, and reviews scored results and performance history.
Live Demo
Frontend (Live App): https://quiz-platform-rho-ten.vercel.app/login
Backend (API): https://quiz-platform-backend-99hi.onrender.com

Demo Credentials:
Admin — email / password
Student — email / password

Note: the backend is hosted on Render's free tier, so it may take 30–60 seconds to respond on the first request after a period of inactivity (cold start).

Features
Admin
Secure admin login
Dashboard with platform statistics (students, quizzes, attempts, pass/fail rates)
Analytics charts (attempts over time, registrations, average scores, popular quizzes/categories)
Create, edit, delete, publish/unpublish quizzes
Create, edit, delete questions with options, correct answers, explanations, and marks
Manage categories
Manage students (view, activate/deactivate, delete)
View individual and platform-wide quiz results
Student
Registration, login, logout, password reset
Search and filter quizzes by category, difficulty, duration, popularity
Quiz details page before starting
Timed quiz-taking interface with question navigation (next/previous/jump-to)
Automatic submission when time expires
Instant, backend-calculated results (score, pass/fail, correct/incorrect/unanswered)
Answer review with explanations
Personal dashboard with attempt history and performance stats
Leaderboard (overall / category-wise / weekly / monthly)

Tech Stack

Frontend

React.js
Tailwind CSS
React Router
Axios
Recharts (analytics charts)
React Hook Form

Backend

Flask / FastAPI / Django — replace with what you actually used
REST API architecture

Database

PostgreSQL

Authentication & Security

JWT (JSON Web Tokens) for stateless session authentication and role-based authorization
bcrypt for one-way password hashing (passwords are never stored in plain text)
Backend-side validation for scoring, timers, and role checks (frontend is never trusted for these)


Run Locally
bash
# Start backend
cd backend
python app.py        # or: npm run dev / uvicorn main:app --reload

# Start frontend (in a separate terminal)
cd frontend
npm run dev

The app will be available at http://localhost:3000 (frontend) and http://localhost:5000 (or your configured backend port).

Deployment
Frontend is deployed on Vercel, auto-deployed from the main branch of this repository.
Backend is deployed on Render, also auto-deployed from main.

Because both platforms are connected directly to this GitHub repo, any push to main triggers an automatic redeploy of whichever app has changed files (see the "Pushing to GitHub Safely" section below for how to avoid unwanted redeploys).

Project Structure
quiz-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── student/
│   │   ├── context/         # auth context, JWT handling
│   │   ├── services/        # Axios API calls
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/           # JWT verification, role checks
│   ├── controllers/
│   └── app.py                # or server.js / main.py
└── README.md
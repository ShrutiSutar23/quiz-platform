const express = require("express");
const prisma = require("../prismaClient");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET admin dashboard stats
router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
    const totalQuizzes = await prisma.quiz.count();
    const publishedQuizzes = await prisma.quiz.count({ where: { status: "PUBLISHED" } });
    const draftQuizzes = await prisma.quiz.count({ where: { status: "DRAFT" } });
    const totalQuestions = await prisma.question.count();

    const attempts = await prisma.attempt.findMany({
      where: { status: { not: "IN_PROGRESS" } },
    });

    const totalAttempts = attempts.length;
    const totalPassed = attempts.filter((a) => a.status === "PASSED").length;
    const totalFailed = attempts.filter((a) => a.status === "FAILED").length;
    const averageScore =
      totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
        : 0;

    res.json({
      totalStudents,
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      totalQuestions,
      totalAttempts,
      totalPassed,
      totalFailed,
      averageScore: Math.round(averageScore * 100) / 100,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET most popular quizzes (by attempt count)
router.get("/popular-quizzes", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: { select: { attempts: true } },
        category: true,
      },
      orderBy: { attempts: { _count: "desc" } },
      take: 5,
    });

    res.json(
      quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        category: q.category?.name,
        attemptCount: q._count.attempts,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET recent attempts across all students (for admin monitoring)
router.get("/recent-attempts", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { status: { not: "IN_PROGRESS" } },
      include: { quiz: true, user: { select: { name: true, email: true } } },
      orderBy: { completedAt: "desc" },
      take: 10,
    });
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
// GET all students with their stats
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        attempts: {
          where: { status: { not: "IN_PROGRESS" } },
          select: { percentage: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = students.map((s) => {
      const totalAttempts = s.attempts.length;
      const avgScore =
        totalAttempts > 0
          ? s.attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
          : 0;
      const highestScore =
        totalAttempts > 0 ? Math.max(...s.attempts.map((a) => a.percentage)) : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        status: s.status,
        createdAt: s.createdAt,
        totalAttempts,
        avgScore: Math.round(avgScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// TOGGLE activate/deactivate a student
router.patch("/users/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "ACTIVE" or "INACTIVE"

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json({ message: "Status updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE a student account
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET leaderboard (top students by average score)
router.get("/leaderboard", async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        attempts: {
          where: { status: { not: "IN_PROGRESS" } },
          select: { percentage: true },
        },
      },
    });

    const leaderboard = students
      .filter((s) => s.attempts.length > 0)
      .map((s) => {
        const totalAttempts = s.attempts.length;
        const avgScore =
          s.attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts;
        return {
          id: s.id,
          name: s.name,
          totalAttempts,
          avgScore: Math.round(avgScore * 100) / 100,
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;

module.exports = router;
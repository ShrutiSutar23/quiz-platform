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

module.exports = router;
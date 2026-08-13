const express = require("express");
const prisma = require("../prismaClient");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// START QUIZ - creates an attempt, sends questions WITHOUT correct answers
router.post("/start/:quizId", verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.userId;

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
    });

    if (!quiz || quiz.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Quiz not available" });
    }

    const previousAttempts = await prisma.attempt.count({
      where: { quizId: parseInt(quizId), userId, status: { not: "IN_PROGRESS" } },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      return res.status(400).json({ message: "Maximum attempts reached for this quiz" });
    }

    const attempt = await prisma.attempt.create({
      data: {
        quizId: parseInt(quizId),
        userId,
        status: "IN_PROGRESS",
      },
    });

    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId) },
      select: {
        id: true,
        questionText: true,
        marks: true,
        options: {
          select: {
            id: true,
            optionText: true,
          },
        },
      },
    });

    res.json({
      attemptId: attempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        duration: quiz.duration,
      },
      questions,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// SUBMIT QUIZ - calculates score on the backend
router.post("/submit/:attemptId", verifyToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId;

    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: { quiz: true },
    });

    if (!attempt || attempt.userId !== userId) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "This attempt is already submitted" });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: attempt.quizId },
      include: { options: true },
    });

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    const answerRecords = [];

    for (const question of questions) {
      totalMarks += question.marks;
      const studentAnswer = answers.find((a) => a.questionId === question.id);
      const correctOption = question.options.find((opt) => opt.isCorrect);

      if (!studentAnswer || !studentAnswer.selectedOptionId) {
        unansweredCount++;
        answerRecords.push({
          attemptId: attempt.id,
          questionId: question.id,
          selectedOptionId: null,
          isCorrect: false,
        });
        continue;
      }

      const isCorrect = studentAnswer.selectedOptionId === correctOption?.id;

      if (isCorrect) {
        correctCount++;
        obtainedMarks += question.marks;
      } else {
        incorrectCount++;
      }

      answerRecords.push({
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: studentAnswer.selectedOptionId,
        isCorrect,
      });
    }

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const status = percentage >= attempt.quiz.passingScore ? "PASSED" : "FAILED";
    const timeTaken = Math.floor((new Date() - attempt.startedAt) / 1000);

    await prisma.answer.createMany({ data: answerRecords });

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        score: obtainedMarks,
        percentage: Math.round(percentage * 100) / 100,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        unanswered: unansweredCount,
        timeTaken,
        status,
        completedAt: new Date(),
      },
    });

    res.json(updatedAttempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET student dashboard stats (MUST be above /:attemptId)
router.get("/stats/summary", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const attempts = await prisma.attempt.findMany({
      where: { userId, status: { not: "IN_PROGRESS" } },
    });

    const totalAttempted = attempts.length;
    const totalPassed = attempts.filter((a) => a.status === "PASSED").length;
    const totalFailed = attempts.filter((a) => a.status === "FAILED").length;

    const averageScore =
      totalAttempted > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempted
        : 0;

    const highestScore =
      totalAttempted > 0
        ? Math.max(...attempts.map((a) => a.percentage))
        : 0;

    const totalQuestionsAnswered = attempts.reduce(
      (sum, a) => sum + a.correctAnswers + a.incorrectAnswers,
      0
    );

    res.json({
      totalAttempted,
      totalPassed,
      totalFailed,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      totalQuestionsAnswered,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET attempt result with review (question, selected answer, correct answer, explanation)
router.get("/:attemptId", verifyToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: {
        quiz: true,
        answers: {
          include: {
            question: { include: { options: true } },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET all attempts for logged-in student
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const attempts = await prisma.attempt.findMany({
      where: { userId, status: { not: "IN_PROGRESS" } },
      include: { quiz: true },
      orderBy: { completedAt: "desc" },
    });
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
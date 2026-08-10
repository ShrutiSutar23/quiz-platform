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

    // Check how many times this student has already attempted this quiz
    const previousAttempts = await prisma.attempt.count({
      where: { quizId: parseInt(quizId), userId, status: { not: "IN_PROGRESS" } },
    });

    if (previousAttempts >= quiz.maxAttempts) {
      return res.status(400).json({ message: "Maximum attempts reached for this quiz" });
    }

    // Create a new attempt record
    const attempt = await prisma.attempt.create({
      data: {
        quizId: parseInt(quizId),
        userId,
        status: "IN_PROGRESS",
      },
    });

    // Get questions WITHOUT revealing correct answers
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
            // isCorrect is NOT selected - hidden from student
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
    const { answers } = req.body; // [{ questionId, selectedOptionId }]
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

    // Get all questions with correct answers (only backend sees this)
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
    const timeTaken = Math.floor((new Date() - attempt.startedAt) / 1000); // seconds

    // Save all answers
    await prisma.answer.createMany({ data: answerRecords });

    // Update attempt with final results
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
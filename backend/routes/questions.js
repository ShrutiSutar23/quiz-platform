const express = require("express");
const prisma = require("../prismaClient");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET all questions for a quiz (Admin - includes correct answers)
router.get("/quiz/:quizId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId) },
      include: { options: true },
      orderBy: { id: "asc" },
    });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// CREATE a question with options (Admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { quizId, questionText, marks, explanation, difficulty, options } = req.body;

    if (!quizId || !questionText || !options || options.length < 2) {
      return res.status(400).json({
        message: "Quiz ID, question text, and at least 2 options are required",
      });
    }

    const hasCorrectAnswer = options.some((opt) => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
      return res.status(400).json({ message: "At least one option must be marked correct" });
    }

    const question = await prisma.question.create({
      data: {
        quizId: parseInt(quizId),
        questionText,
        marks: marks ? parseInt(marks) : 1,
        explanation,
        difficulty,
        options: {
          create: options.map((opt) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect || false,
          })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE a question (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Question deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
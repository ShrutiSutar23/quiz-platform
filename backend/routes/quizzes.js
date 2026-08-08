const express = require("express");
const prisma = require("../prismaClient");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET all quizzes (public sees only PUBLISHED, admin sees all)
router.get("/", async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET all quizzes for Admin (includes drafts)
router.get("/admin/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET single quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// CREATE quiz (Admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      difficulty,
      duration,
      passingScore,
      maxAttempts,
    } = req.body;

    if (!title || !categoryId || !duration) {
      return res.status(400).json({
        message: "Title, category, and duration are required",
      });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        difficulty,
        duration: parseInt(duration),
        passingScore: passingScore ? parseInt(passingScore) : 60,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : 1,
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// UPDATE quiz (Admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      categoryId,
      difficulty,
      duration,
      passingScore,
      maxAttempts,
    } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        difficulty,
        duration: duration ? parseInt(duration) : undefined,
        passingScore: passingScore ? parseInt(passingScore) : undefined,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : undefined,
      },
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE quiz (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.quiz.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Quiz deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// PUBLISH/UNPUBLISH quiz (Admin only)
router.patch("/:id/publish", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "PUBLISHED" or "UNPUBLISHED" or "DRAFT"

    const quiz = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
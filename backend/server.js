const express = require("express");
const quizRoutes = require("./routes/quizzes");
const cors = require("cors");
const questionRoutes = require("./routes/questions");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const attemptRoutes = require("./routes/attempts");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);


app.get("/", (req, res) => {
  res.send("Quiz Platform Backend is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/quizzes", quizRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
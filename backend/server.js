const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Quiz Platform Backend is running!");
});

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
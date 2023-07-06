require('dotenv').config();
const express = require("express");
const app = express();
const usersRoute = require("./Routes/usersRoute");
const quizzesRoute = require("./Routes/quizzesRoute");

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/users", usersRoute);
app.use("/api/quizzes", quizzesRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

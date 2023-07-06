const express = require("express");
const Router = express.Router();
const quizzesController = require("../Controllers/quizzesController");

Router.post("/create", async (req, res, next) => {
  try {
    await quizzesController.createQuiz(req, res);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Failed to create quiz" });
  }
});

Router.post("/submit", async (req, res, next) => {
  try {
    await quizzesController.attemptQuiz(req, res);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
});

Router.get("/:quizId/participants", async (req, res, next) => {
  try {
    await quizzesController.getParticipants(req, res);
  } catch (error) {
    console.error("Error getting participants:", error);
    res.status(500).json({ message: "Failed to get participants" });
  }
});

module.exports = Router;

const db = require("../db.js");
const { ObjectId } = require("mongodb");
const Score = require("../utils/GetScore.js");

const createQuiz = async (req, res) => {
  try {
    const quiz = req.body;
    if (!quiz) {
      return res.status(400).json({ error: "Incomplete Parameters" });
    }

    quiz.questions.forEach((question, i) => {
      question.id = i + 1;
    });

    await db.executeWithDB(async (db) => {
      quiz.responses = [];
      const result = await db.collection("quizzes").insertOne(quiz);
      const insertedQuizId = result.insertedId;
      
      const query = { uid: quiz.uid };
      const addQuiz = {
        $push: { createdQuiz: insertedQuizId },
      };
      await db.collection("users").updateOne(query, addQuiz);

      res.status(200).json({
        message: "Quiz created successfully",
        quizId: insertedQuizId,
      });
      console.log("Quiz ID:", insertedQuizId);
      console.log("Quiz Added to Creator Document:", insertedQuizId);
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Failed to create quiz" });
  }
};


const attemptQuiz = async (req, res) => {
  try {
    const submittedQuiz = req.body;
    if (!submittedQuiz) {
      return res.status(400).json({ error: "Incomplete Parameters" });
    }

    await db.executeWithDB(async (db) => {
      const validationCursor = db.collection("users").find({
        $and: [
          { uid: submittedQuiz.userId },
          { attemptedQuiz: new ObjectId(submittedQuiz.quizId) },
        ],
      });
      const quizData = await validationCursor.toArray();
      console.log({ quizData });
      if (quizData[0]) {
        console.log("Quiz already attempted");
        return res.status(200).json({
          error: "ERR:QUIZ_ALREADY_ATTEMPTED",
        });
      }

      const cursor = db.collection("quizzes").find({
        _id: new ObjectId(submittedQuiz.quizId),
      }).project({ questions: 1 });

      const quiz = await cursor.toArray();
      const questions = quiz[0].questions;

      console.log("Questions:", questions);
      console.log("Submitted Quiz:", submittedQuiz);

      const score = Score.calculate(questions, submittedQuiz.responses);
      console.log("Score:", score);

      res.status(200).json({ score });

      await db.collection("quizzes").updateOne(
        { _id: new ObjectId(submittedQuiz.quizId) },
        {
          $push: {
            responses: { userId: submittedQuiz.userId, score: score },
          },
        }
      );

      await db.collection("users").updateOne(
        { uid: submittedQuiz.userId },
        {
          $push: {
            attemptedQuiz: new ObjectId(submittedQuiz.quizId),
          },
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Failed to attempt the quiz" });
  }
};

const getParticipants = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({ error: "Incomplete Parameters" });
    }

    await db.executeWithDB(async (db) => {
      const quizObjectId = new ObjectId(quizId);

      const quiz = await db.collection("quizzes").findOne({ _id: quizObjectId });

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const response = await db.collection("quizzes").aggregate([
        { $match: { _id: quizObjectId } },
        { $unwind: "$responses" },
        {
          $lookup: {
            from: "users",
            localField: "responses.userId",
            foreignField: "uid",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            name: "$user.name",
            email: "$user.email",
            score: "$responses.score",
          },
        },
      ]).toArray();

      res.status(200).json(response);
    });
  } catch (error) {
    console.log("Error fetching participants: ", error);
    res.status(500).json({ message: "Error fetching participants", error });
  }
};

module.exports = {
  createQuiz,
  attemptQuiz,
  getParticipants,
};

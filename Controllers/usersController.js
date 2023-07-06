const db = require("../db.js");

const createUser = async (req, res) => {
  const { uid, name, email } = req.body;
  if (!uid || !name || !email) {
    return res.status(400).json({ error: "Incomplete parameters" });
  }
  try {
    await db.executeWithDB(async (db) => {
      const user = await db.collection("users").findOne({ uid: uid });
      if (!user) {
        const result = await db.collection("users").insertOne({
          uid,
          name,
          email,
          createdQuiz: [],
          attemptedQuiz: [],
        });
        res.status(200).json({ message: "User Created successfully." });
      } else {
        res.status(200).json({ message: "User Record Exist" });
      }
    });
  } catch (error) {
    console.log("Error creating user: ", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

const getUserData = async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) {
      return res.status(400).json({ error: "Incomplete Parameters" });
    }

    await db.executeWithDB(async (db) => {
      const createdCursor = db.collection("quizzes").find({ uid }).project({
        isOpen: 1,
        title: 1,
        questions: 1,
        responses: {
          $size: "$responses",
        },
      });
      const createdQuiz = await createdCursor.toArray();
      console.log(createdQuiz);
      const userCursor = await db.collection("users").find({ uid }).project({
        attemptedQuiz: 1,
      });
      const userInfo = await userCursor.toArray();
      if (userInfo.length > 0) {
        const attemptedCursor = db
          .collection("quizzes")
          .find({ _id: { $in: userInfo[0].attemptedQuiz } })
          .project({
            title: 1,
            totalQuestions: {
              $size: "$questions",
            },
            responses: { $elemMatch: { uid } },
          });
        const attemptedQuiz = await attemptedCursor.toArray();
        console.log(attemptedQuiz);
        res.status(200).json({ createdQuiz, attemptedQuiz });
      } else {
        res.status(200).json({ createdQuiz, attemptedQuiz: [] });
      }
    });
  } catch (error) {
    console.log("Error fetching user data: ", error);
    res.status(500).json({ message: "Error fetching user data", error });
  }
};

module.exports = {
  createUser,
  getUserData,
};

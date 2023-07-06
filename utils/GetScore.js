const Score = {
  calculate: (questions, userResponses) => {
    try {
      let score = 0;
      for (const question of questions) {
        const isCorrect = Score.checkAnswer(question, userResponses);

        if (isCorrect) {
          score += 1;
        }
      }
      return score;
    } catch (error) {
      console.error("Error calculating score:", error);
      throw new Error("Failed to calculate score");
    }
  },
  checkAnswer: (question, userResponses) => {
    try {
      const selectedOptions = userResponses[question.id];
      if (selectedOptions.length !== question.correctAnswers.length) {
        return false;
      }
      for (const option of selectedOptions) {
        if (!question.correctAnswers.includes(option)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking answer:", error);
      throw new Error("Failed to check answer");
    }
  },
};

module.exports = Score;

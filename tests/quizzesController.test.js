const { createQuiz, attemptQuiz, getParticipants } = require('../Controllers/quizzesController');
const db = require('../db');
const Score = require('../utils/GetScore');

test('createQuiz should return a success response with a quiz ID', async () => {
    // Mock the request and response objects
    const req = {
      body: {
        title: 'My Quiz',
        questions: [{
            "id": 1,
      "text": "Question 1",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correctAnswers": [1]
        }, {
            "id": 2,
      "text": "Question 2",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correctAnswers": [2, 3]
        }] 
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock the database execution
    const executeWithDBMock = jest.spyOn(db, 'executeWithDB');
    executeWithDBMock.mockImplementation(async (callback) => {
      await callback({
        collection: jest.fn().mockReturnThis(),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockQuizId' }),
        updateOne: jest.fn().mockResolvedValue(),
      });
    });
  
    // Call the controller function
    await createQuiz(req, res);
    
    // Verify the result
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Quiz created successfully',
      quizId: 'mockQuizId'
    });
  
    // Restore the mock
    executeWithDBMock.mockRestore();
  });

  test('attemptQuiz should return the score and update the quiz and user collections', async () => {
    // Mock the request and response objects
    const req = {
      body: {
        userId: 'mockUserId',
        quizId: 'mockQuizId',
        responses: {
            "1": [1],
            "2": [2],
            "3": [3]
        }
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    // Mock the database execution
    const executeWithDBMock = jest.spyOn(db, 'executeWithDB');
    executeWithDBMock.mockImplementation(async (callback) => {
      const cursorMock = {
        toArray: jest.fn().mockResolvedValueOnce([{ userId: 'mockUserId' }]),
        project: jest.fn().mockReturnThis()
      };
      const collectionMock = {
        find: jest.fn(() => cursorMock),
        updateOne: jest.fn().mockResolvedValue(),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockQuizId' }),
      };
      await callback({
        collection: jest.fn().mockImplementation((name) => {
          if (name === 'quizzes') return collectionMock;
          if (name === 'users') return collectionMock;
        }),
      });
    });
  
    // Mock the Score.calculate function
    const calculateMock = jest.spyOn(Score, 'calculate');
    calculateMock.mockReturnValue(2); 
  
    // Call the controller function
    await attemptQuiz(req, res);
  
    // Verify the result
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ score: 2 });
  
    // Restore the mocks
    executeWithDBMock.mockRestore();
    calculateMock.mockRestore();
  });

  test('getParticipants should return an array of participants for a given quiz', async () => {
    // Mock the request and response objects
    const req = {
      params: {
        quizId: 'mockQuizId'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    // Mock the database execution
    const executeWithDBMock = jest.spyOn(db, 'executeWithDB');
    executeWithDBMock.mockImplementation(async (callback) => {
      const aggregateMock = jest.fn().mockResolvedValueOnce([{ name: 'anubhav ladha', email: 'anubhavladha11@gmail.com', score: 2 }]);
      const collectionMock = {
        findOne: jest.fn().mockResolvedValueOnce({ _id: 'mockQuizId' }),
        aggregate: jest.fn(() => ({
          match: jest.fn().mockReturnThis(),
          unwind: jest.fn().mockReturnThis(),
          lookup: jest.fn().mockReturnThis(),
          project: jest.fn().mockReturnThis(),
          toArray: aggregateMock
        }))
      };
      await callback({
        collection: jest.fn().mockImplementation(() => collectionMock)
      });
    });
  
    // Call the controller function
    await getParticipants(req, res);
  
    // Verify the result
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ name: 'anubhav ladha', email: 'anubhavladha11@gmail.com', score: 2 }]);
  
    // Restore the mock
    executeWithDBMock.mockRestore();
  });

const { createUser, getUserData } = require('../Controllers/usersController');
const db = require('../db');

test('createUser should return a success response when creating a new user', async () => {
  // Mock the request and response objects
  const req = {
    body: {
      uid: 'Anubhav2102',
      name: 'Anubhav Ladha',
      email: 'anubhavladha11@gmail.com'
    }
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Mock the database execution
  const executeWithDBMock = jest.spyOn(db, 'executeWithDB');
  executeWithDBMock.mockImplementation(async (callback) => {
    const collectionMock = {
      findOne: jest.fn().mockResolvedValueOnce(null),
      insertOne: jest.fn().mockResolvedValueOnce()
    };
    await callback({
      collection: jest.fn().mockReturnValueOnce(collectionMock)
    });
  });

  // Call the controller function
  await createUser(req, res);

  // Verify the result
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: 'User Created successfully.' });

  // Restore the mock
  executeWithDBMock.mockRestore();
});

test('createUser should return a success response when user record already exists', async () => {
  // Mock the request and response objects
  const req = {
    body: {
      uid: 'Anubhav2102',
      name: 'Anubhav Ladha',
      email: 'anubhavladha11@gmail.com'
    }
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Mock the database execution
  const executeWithDBMock = jest.spyOn(db, 'executeWithDB');
  executeWithDBMock.mockImplementation(async (callback) => {
    const collectionMock = {
      findOne: jest.fn().mockResolvedValueOnce({ uid: 'mockUid' })
    };
    await callback({
      collection: jest.fn().mockReturnValueOnce(collectionMock)
    });
  });

  // Call the controller function
  await createUser(req, res);

  // Verify the result
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: 'User Record Exist' });

  // Restore the mock
  executeWithDBMock.mockRestore();
});

test('getUserData should return the user data with created and attempted quizzes', async () => {
  // Mock the request and response objects
  const req = {
    params: {
      uid: 'mockUid'
    }
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  // Mock the database execution
  const executeWithDBMock = jest.spyOn(db, 'executeWithDB');
  executeWithDBMock.mockImplementation(async (callback) => {
    const collectionMock = {
      find: jest.fn(() => ({
        project: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValueOnce([{ uid: 'mockUid' }])
      }))
    };
    await callback({
      collection: jest.fn().mockReturnValueOnce(collectionMock)
    });
  });

  // Call the controller function
  await getUserData(req, res);

  // Verify the result
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ createdQuiz: [], attemptedQuiz: [] });

  // Restore the mock
  executeWithDBMock.mockRestore();
});

const { MongoClient } = require("mongodb");

let database;

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log('Connecting to the database...');
      const client = await MongoClient.connect(process.env.DB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to the database successfully.');
      database = client.db(process.env.DB_NAME_QUIZ);
    }
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Failed to connect to the database');
  }
};

connectDB();

const executeWithDB = async (operations, res) => {
  try {
    if (!database && process.env.NODE_ENV !== 'test') {
      // Connect to the database if not already connected
      await connectDB();
    }
    await operations(database);
  } catch (error) {
    console.log("Error executing database operations: ", error);
    res.status(500).json({ message: "Error executing database operations", error });
  }
};

module.exports.executeWithDB = executeWithDB;

const { MongoClient } = require("mongodb");

let database;

const connectDB = async () => {
  try {
    console.log("Connecting to the database...");
    const client = await MongoClient.connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database successfully.");
    database = client.db(process.env.DB_NAME_QUIZ);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

connectDB();

const executeWithDB = async (operations, res) => {
  try {
    await operations(database);
  } catch (error) {
    console.log("Error executing database operations: ", error);
    res.status(500).json({ message: "Error executing database operations", error });
  }
};

module.exports.executeWithDB = executeWithDB;

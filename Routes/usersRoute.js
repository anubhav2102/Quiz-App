const express = require("express");
const Router = express.Router();
const usersController = require("../Controllers/usersController");

Router.post("/create", async (req, res, next) => {
  try {
    await usersController.createUser(req, res);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

Router.get("/:uid", async (req, res, next) => {
  try {
    await usersController.getUserData(req, res);
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ message: "Failed to get user data" });
  }
});

module.exports = Router;

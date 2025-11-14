const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  // Validate username and password are provided
  if (!username || !password) {
    return response
      .status(400)
      .json({ error: "username and password are required" });
  }

  // Validate password length (minlength 3)
  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: "password must be at least 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.name === "MongoServerError" && error.code === 11000) {
      return response
        .status(400)
        .json({ error: "expected `username` to be unique" });
    }
    response.status(400).json({ error: error.message });
  }
});

module.exports = usersRouter;

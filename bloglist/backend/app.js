const express = require("express");
const mongoose = require("mongoose");
const blogsRouter = require("./api/blogsRouter");
const usersRouter = require("./api/usersRouter");
const loginRouter = require("./api/loginRouter");
const testingRouter = require("./api/testingRouter");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

const config = require("./utils/config");

const app = express();

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/testing", testingRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

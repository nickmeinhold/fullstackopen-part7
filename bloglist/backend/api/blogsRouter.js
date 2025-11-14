const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const { tokenExtractor } = require("../utils/middleware");
const logger = require("../utils/logger");

const blogsRouter = express.Router();

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  logger.info("Retrieved blogs");
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate("user", {
    username: 1,
    name: 1,
  });
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", tokenExtractor, async (request, response) => {
  const user = request.user; // Already verified by middleware

  if (!request.body.title || !request.body.url) {
    return response.status(400).json({
      message: "Missing title or url",
    });
  }

  try {
    // Get the user from the database using the decoded token
    if (!user || !user.id) {
      logger.error("Token user missing or user.id undefined:", user);
      return response.status(401).json({ error: "invalid token" });
    }

    const foundUser = await User.findById(user.id);

    if (!foundUser) {
      logger.error("User not found in database for id:", user.id);
      return response.status(401).json({ error: "user not found" });
    }

    const blog = new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes ?? 0,
      user: foundUser._id,
    });

    const savedBlog = await blog.save();
    foundUser.blogs = foundUser.blogs.concat(savedBlog._id);
    await foundUser.save();

    const populatedBlog = await savedBlog.populate("user", {
      username: 1,
      name: 1,
    });

    response.status(201).json(populatedBlog);
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      message: "There was a problem saving the blog",
      data: error,
    });
  }
});

blogsRouter.delete("/:id", tokenExtractor, async (request, response) => {
  const user = request.user; // Already verified by middleware

  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }

  // Check if the user is the owner of the blog
  if (blog.user.toString() !== user.id) {
    return response
      .status(403)
      .json({ error: "only the creator can delete this blog" });
  }

  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true }
  ).populate("user", { username: 1, name: 1 });

  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    response.status(404).json({ error: "blog not found" });
  }
});

module.exports = blogsRouter;

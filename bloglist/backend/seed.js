require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Blog = require("./models/blog");
const config = require("./utils/config");

async function run() {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to DB");

  // Optional: clear existing data
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await new User({
    username: "seeduser",
    name: "Seed User",
    passwordHash,
  }).save();

  const blogs = [
    {
      title: "First seeded blog",
      author: "Seeder",
      url: "http://example.com/1",
      likes: 5,
      user: user._id,
    },
    {
      title: "Second seeded blog",
      author: "Seeder",
      url: "http://example.com/2",
      user: user._id,
    },
  ];

  const inserted = await Blog.insertMany(blogs);
  user.blogs = inserted.map((b) => b._id);
  await user.save();

  console.log(`Inserted ${inserted.length} blogs`);
  await mongoose.connection.close();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

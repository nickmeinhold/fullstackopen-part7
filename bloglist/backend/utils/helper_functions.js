const _ = require("lodash");

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const mostBlogs = (blogs) => {
  const grouped = _.groupBy(blogs, "author");
  const authorWithMostBlogs = _.maxBy(
    Object.keys(grouped),
    (author) => grouped[author].length
  );
  return {
    author: authorWithMostBlogs,
    blogs: grouped[authorWithMostBlogs].length,
  };
};

const mostLikes = (blogs) => {
  let maxLikes = 0;
  let favouriteBlog;

  for (const blog of blogs) {
    if (blog.likes > maxLikes) {
      maxLikes = blog.likes;
      favouriteBlog = blog;
    }
  }

  return { title: favouriteBlog.title, author: favouriteBlog.author };
};

module.exports = {
  totalLikes,
  mostBlogs,
  mostLikes,
};

import { useState } from "react";
import blogService from "../services/blogs";

const Blog = ({ blog, user, onUpdated, handleDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [likes, setLikes] = useState(blog.likes);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const handleLike = async () => {
    try {
      const updated = await blogService.update(blog.id, {
        ...blog,
        likes: likes + 1,
      });
      setLikes(updated.likes);
      onUpdated && onUpdated(updated);
    } catch (error) {
      console.error("Failed to like blog:", error);
    }
  };

  const isCreator = user && blog.user && user.username === blog.user.username;

  return (
    <div style={blogStyle} data-testid="blog-card">
      <span data-testid="blog-title-author">
        {blog.title} {blog.author}
      </span>
      <button
        data-testid="toggle-details"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "hide" : "view"}
      </button>
      {showDetails && (
        <div data-testid="blog-details">
          <p data-testid="blog-url">url: {blog.url}</p>
          <p data-testid="blog-likes">
            likes: <span data-testid="likes-count">{likes}</span>{" "}
            <button data-testid="like-button" onClick={handleLike}>
              like
            </button>
          </p>
          <p data-testid="blog-added-by">
            added by: {blog.user?.name || blog.user?.username || "unknown"}
          </p>
          {isCreator && (
            <button
              data-testid="delete-button"
              onClick={() => handleDelete(blog)}
            >
              delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Blog;

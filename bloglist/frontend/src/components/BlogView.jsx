import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import blogService from "../services/blogs";
import { useNotification } from "../contexts/NotificationContext";

const BlogView = ({ user }) => {
  const [comment, setComment] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setNotification } = useNotification();

  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogs", id],
    queryFn: () => blogService.getOne(id),
    enabled: !!user,
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blog }) => blogService.update(id, blog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs", id] });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setNotification(`Blog '${blog.title}' deleted`);
      navigate("/");
    },
    onError: (error) => {
      setNotification(
        error.response?.data?.error || "failed to delete blog",
        "error"
      );
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, comment }) => blogService.addComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs", id] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setComment("");
      setNotification("comment added");
    },
    onError: (error) => {
      setNotification(
        error.response?.data?.error || "failed to add comment",
        "error"
      );
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !blog) {
    return <div>Blog not found</div>;
  }

  const handleLike = () => {
    updateBlogMutation.mutate({
      id: blog.id,
      blog: { ...blog, likes: blog.likes + 1 },
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlogMutation.mutate(blog.id);
    }
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate({ id: blog.id, comment: comment.trim() });
    }
  };

  const isCreator = user && blog.user && user.username === blog.user.username;

  return (
    <div>
      <h2>
        {blog.title} {blog.author}
      </h2>
      <div>
        <a href={blog.url} target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
      </div>
      <div>
        {blog.likes} likes <button onClick={handleLike}>like</button>
      </div>
      <div>added by {blog.user?.name || blog.user?.username || "unknown"}</div>
      {isCreator && (
        <div>
          <button onClick={handleDelete}>remove</button>
        </div>
      )}
      <h3>comments</h3>
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="add a comment..."
        />
        <button type="submit">add comment</button>
      </form>
      {blog.comments && blog.comments.length > 0 ? (
        <ul>
          {blog.comments.map((comment, index) => (
            <li key={index}>{comment}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet</p>
      )}
    </div>
  );
};

export default BlogView;

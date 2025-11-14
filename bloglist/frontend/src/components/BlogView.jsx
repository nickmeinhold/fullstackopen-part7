import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Button,
  Link,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteIcon from "@mui/icons-material/Delete";
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
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {blog.title} <em>{blog.author}</em>
      </Typography>

      <Paper sx={{ padding: 2, marginY: 2 }}>
        <Box sx={{ marginY: 1 }}>
          <Link
            href={blog.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            {blog.url}
          </Link>
        </Box>

        <Box sx={{ marginY: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body1">{blog.likes} likes</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<ThumbUpIcon />}
            onClick={handleLike}
          >
            like
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ marginY: 1 }}>
          added by {blog.user?.name || blog.user?.username || "unknown"}
        </Typography>

        {isCreator && (
          <Box sx={{ marginTop: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              remove
            </Button>
          </Box>
        )}
      </Paper>

      <Typography
        variant="h5"
        component="h3"
        gutterBottom
        sx={{ marginTop: 3 }}
      >
        comments
      </Typography>

      <Box component="form" onSubmit={handleCommentSubmit} sx={{ marginY: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="add a comment..."
          sx={{ marginBottom: 1 }}
        />
        <Button type="submit" variant="contained" color="primary">
          add comment
        </Button>
      </Box>

      {blog.comments && blog.comments.length > 0 ? (
        <List>
          {blog.comments.map((comment, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={comment} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No comments yet
        </Typography>
      )}
    </Box>
  );
};

export default BlogView;

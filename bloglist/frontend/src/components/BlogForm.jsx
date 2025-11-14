import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const BlogForm = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate({ title, author, url });
    setTitle("");
    setAuthor("");
    setUrl("");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ marginY: 2 }}>
      <TextField
        fullWidth
        label="title"
        value={title}
        onChange={({ target }) => setTitle(target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="author"
        value={author}
        onChange={({ target }) => setAuthor(target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="url"
        type="url"
        value={url}
        onChange={({ target }) => setUrl(target.value)}
        margin="normal"
        required
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
      >
        create
      </Button>
    </Box>
  );
};

export default BlogForm;

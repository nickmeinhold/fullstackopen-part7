import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import blogService from "../services/blogs";

// Async thunks
export const initializeBlogs = createAsyncThunk(
  "blogs/initializeBlogs",
  async () => {
    const blogs = await blogService.getAll();
    return blogs;
  }
);

export const createBlog = createAsyncThunk(
  "blogs/createBlog",
  async (blogObject) => {
    const newBlog = await blogService.create(blogObject);
    return newBlog;
  }
);

export const likeBlog = createAsyncThunk("blogs/likeBlog", async (blog) => {
  const updatedBlog = await blogService.update(blog.id, {
    ...blog,
    likes: blog.likes + 1,
  });
  return updatedBlog;
});

export const deleteBlog = createAsyncThunk("blogs/deleteBlog", async (id) => {
  await blogService.remove(id);
  return id;
});

const blogsSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    updateBlog(state, action) {
      const updatedBlog = action.payload;
      return state.map((blog) =>
        blog.id === updatedBlog.id ? updatedBlog : blog
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeBlogs.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(likeBlog.fulfilled, (state, action) => {
        const updatedBlog = action.payload;
        return state.map((blog) =>
          blog.id === updatedBlog.id ? updatedBlog : blog
        );
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        const id = action.payload;
        return state.filter((blog) => blog.id !== id);
      });
  },
});

export const { updateBlog } = blogsSlice.actions;

export default blogsSlice.reducer;

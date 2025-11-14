import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import loginService from "../services/login";
import blogService from "../services/blogs";

// Thunk to handle login
export const loginUser = createAsyncThunk("user/login", async (credentials) => {
  const user = await loginService.login(credentials);
  window.localStorage.setItem("loggedBlogAppUser", JSON.stringify(user));
  blogService.setToken(user.token);
  return user;
});

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload;
    },
    clearUser() {
      return null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const { setUser, clearUser } = userSlice.actions;

// Thunk to initialize user from localStorage
export const initializeUser = () => {
  return (dispatch) => {
    const stored = window.localStorage.getItem("loggedBlogAppUser");
    if (stored) {
      const user = JSON.parse(stored);
      dispatch(setUser(user));
      blogService.setToken(user.token);
    }
  };
};

// Thunk to handle logout
export const logoutUser = () => {
  return (dispatch) => {
    window.localStorage.removeItem("loggedBlogAppUser");
    blogService.setToken(null);
    dispatch(clearUser());
  };
};

export default userSlice.reducer;

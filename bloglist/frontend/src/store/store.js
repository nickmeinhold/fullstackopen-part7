import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import blogsReducer from "./blogsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    blogs: blogsReducer,
  },
});

export default store;

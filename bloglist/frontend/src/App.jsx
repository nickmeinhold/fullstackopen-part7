import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Blog from "./components/Blog";
import BlogForm from "./components/BlogForm";
import LoginForm from "./components/LoginForm";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";
import { showNotification } from "./store/notificationSlice";
import { initializeUser, loginUser, logoutUser } from "./store/userSlice";
import {
  initializeBlogs,
  createBlog,
  deleteBlog,
  updateBlog,
} from "./store/blogsSlice";

const App = () => {
  const blogFormRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const blogs = useSelector((state) => state.blogs);

  // Sort blogs by likes (most liked first)
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(initializeBlogs());
    }
  }, [dispatch, user]);

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await dispatch(loginUser({ username, password })).unwrap();
      dispatch(showNotification(`welcome back ${user.name || user.username}`));
    } catch (error) {
      dispatch(
        showNotification(error.response?.data?.error || "login failed", "error")
      );
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(showNotification("logged out"));
  };

  const handleCreateBlog = async (blog) => {
    try {
      const created = await dispatch(createBlog(blog)).unwrap();
      const creator = created.user?.name || created.user?.username || "unknown";
      dispatch(showNotification(`added '${created.title}' by ${creator}`));
      blogFormRef.current?.toggleVisibility();
    } catch (error) {
      dispatch(
        showNotification(
          error.response?.data?.error || "failed to create blog",
          "error"
        )
      );
    }
  };

  const handleDeleteBlog = async (blog) => {
    try {
      if (confirm("Are you sure you want to delete?")) {
        await dispatch(deleteBlog(blog.id)).unwrap();
        dispatch(showNotification(`Deleted '${blog.title}'`));
      }
    } catch (error) {
      dispatch(
        showNotification(
          error.response?.data?.error || "failed to delete blog",
          "error"
        )
      );
    }
  };

  const handleUpdateBlog = (updated) => {
    dispatch(updateBlog(updated));
  };

  return (
    <div>
      <Notification />
      {!user ? (
        <>
          <LoginForm handleLogin={handleLogin} />
        </>
      ) : (
        <div>
          <h2>blogs</h2>
          <p>
            {user.name} logged in <button onClick={handleLogout}>logout</button>
          </p>
          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm onCreate={handleCreateBlog} />
          </Togglable>
          {sortedBlogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              user={user}
              onUpdated={handleUpdateBlog}
              handleDelete={handleDeleteBlog}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;

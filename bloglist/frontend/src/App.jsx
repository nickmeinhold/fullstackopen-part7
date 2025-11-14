import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import Blog from "./components/Blog";
import BlogForm from "./components/BlogForm";
import LoginForm from "./components/LoginForm";
import Notification from "./components/Notification";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Togglable from "./components/Togglable";
import { showNotification } from "./store/notificationSlice";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const blogFormRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("loggedBlogAppUser");
    if (stored) {
      const data = JSON.parse(stored);
      setUser(data);
      blogService.setToken(data.token);
    }
  }, []);

  const handleLogin = async ({ username, password }) => {
    try {
      const data = await loginService.login({ username, password });
      setUser(data);
      window.localStorage.setItem("loggedBlogAppUser", JSON.stringify(data));
      // Set token for future blog service calls when we add protected endpoints
      blogService.setToken(data.token);
      dispatch(showNotification(`welcome back ${data.name || data.username}`));
    } catch (error) {
      dispatch(
        showNotification(error.response?.data?.error || "login failed", "error")
      );
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogAppUser");
    setUser(null);
    blogService.setToken(null);
    dispatch(showNotification("logged out"));
  };

  const handleCreateBlog = async (blog) => {
    try {
      const created = await blogService.create(blog);
      setBlogs((prev) => prev.concat(created));
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
        await blogService.remove(blog.id);
        setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
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
    setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
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
          {blogs
            .slice()
            .sort((a, b) => b.likes - a.likes)
            .map((blog) => (
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

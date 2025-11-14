import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Container } from "@mui/material";
import Blog from "./components/Blog";
import BlogForm from "./components/BlogForm";
import BlogView from "./components/BlogView";
import LoginForm from "./components/LoginForm";
import Navigation from "./components/Navigation";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";
import Users from "./components/Users";
import { useNotification } from "./contexts/NotificationContext";
import { initializeUser, loginUser, logoutUser } from "./store/userSlice";
import blogService from "./services/blogs";

const App = () => {
  const blogFormRef = useRef(null);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { setNotification } = useNotification();
  const user = useSelector((state) => state.user);

  // Fetch blogs with React Query
  const {
    data: blogs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: blogService.getAll,
    enabled: !!user, // Only fetch when user is logged in
  });

  // Sort blogs by likes (most liked first)
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);

  // Mutation for creating a blog
  const createBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (newBlog) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      const creator = newBlog.user?.name || newBlog.user?.username || "unknown";
      setNotification(`added '${newBlog.title}' by ${creator}`);
      blogFormRef.current?.toggleVisibility();
    },
    onError: (error) => {
      setNotification(
        error.response?.data?.error || "failed to create blog",
        "error"
      );
    },
  });

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  const handleLogin = async ({ username, password }) => {
    try {
      const user = await dispatch(loginUser({ username, password })).unwrap();
      setNotification(`welcome back ${user.name || user.username}`);
    } catch (error) {
      setNotification(error.response?.data?.error || "login failed", "error");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setNotification("logged out");
  };

  const handleCreateBlog = (blog) => {
    createBlogMutation.mutate(blog);
  };

  if (isError) {
    return (
      <div>
        <Notification />
        <div>Error loading blogs</div>
      </div>
    );
  }

  const Home = () => (
    <div>
      <h2>blogs</h2>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm onCreate={handleCreateBlog} />
      </Togglable>
      {isLoading ? (
        <div>Loading blogs...</div>
      ) : (
        sortedBlogs.map((blog) => <Blog key={blog.id} blog={blog} />)
      )}
    </div>
  );

  return (
    <Container>
      <Router>
        <Notification />
        {!user ? (
          <LoginForm handleLogin={handleLogin} />
        ) : (
          <>
            <Navigation user={user} handleLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/blogs/:id" element={<BlogView user={user} />} />
            </Routes>
          </>
        )}
      </Router>
    </Container>
  );
};

export default App;

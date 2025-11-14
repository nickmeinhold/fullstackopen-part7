import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Blog from "./components/Blog";
import BlogForm from "./components/BlogForm";
import LoginForm from "./components/LoginForm";
import Notification from "./components/Notification";
import Togglable from "./components/Togglable";
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

  // Mutation for deleting a blog
  const deleteBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  // Mutation for updating a blog
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blog }) => blogService.update(id, blog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
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

  const handleDeleteBlog = async (blog) => {
    if (confirm("Are you sure you want to delete?")) {
      try {
        await deleteBlogMutation.mutateAsync(blog.id);
        setNotification(`Deleted '${blog.title}'`);
      } catch (error) {
        setNotification(
          error.response?.data?.error || "failed to delete blog",
          "error"
        );
      }
    }
  };

  const handleUpdateBlog = (updated) => {
    updateBlogMutation.mutate({ id: updated.id, blog: updated });
  };

  if (isError) {
    return (
      <div>
        <Notification />
        <div>Error loading blogs</div>
      </div>
    );
  }

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
          {isLoading ? (
            <div>Loading blogs...</div>
          ) : (
            sortedBlogs.map((blog) => (
              <Blog
                key={blog.id}
                blog={blog}
                user={user}
                onUpdated={handleUpdateBlog}
                handleDelete={handleDeleteBlog}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default App;

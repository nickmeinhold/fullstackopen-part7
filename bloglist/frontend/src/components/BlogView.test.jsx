import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import BlogView from "./BlogView";
import * as blogService from "../services/blogs";
import { NotificationContextProvider } from "../contexts/NotificationContext";

vi.mock("../services/blogs");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = (blogId = "123") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <NotificationContextProvider>
        <MemoryRouter initialEntries={[`/blogs/${blogId}`]}>
          <Routes>
            <Route path="/blogs/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </NotificationContextProvider>
    </QueryClientProvider>
  );
};

describe("BlogView component", () => {
  const sampleBlog = {
    id: "123",
    title: "Testing React Router",
    author: "Test Author",
    url: "http://example.com/blog",
    likes: 15,
    user: { username: "testuser", name: "Test User" },
  };

  const currentUser = {
    username: "testuser",
    name: "Test User",
    token: "fake-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state initially", () => {
    blogService.default.getOne = vi.fn(() => new Promise(() => {}));

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders blog details after loading", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Testing React Router Test Author/i,
        })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("http://example.com/blog")).toBeInTheDocument();
    expect(screen.getByText(/15 likes/)).toBeInTheDocument();
    expect(screen.getByText(/added by Test User/)).toBeInTheDocument();
  });

  test("renders error message when blog is not found", async () => {
    blogService.default.getOne = vi
      .fn()
      .mockRejectedValue(new Error("Not found"));

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("999"),
    });

    await waitFor(() => {
      expect(screen.getByText("Blog not found")).toBeInTheDocument();
    });
  });

  test("shows remove button only for blog creator", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /remove/i })
      ).toBeInTheDocument();
    });
  });

  test("does not show remove button for non-creator", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);

    const differentUser = {
      username: "differentuser",
      name: "Different User",
      token: "fake-token",
    };

    render(<BlogView user={differentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Testing React Router Test Author/i,
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /remove/i })
    ).not.toBeInTheDocument();
  });

  test("clicking like button calls update with incremented likes", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);
    blogService.default.update = vi.fn().mockResolvedValue({
      ...sampleBlog,
      likes: 16,
    });

    const user = userEvent.setup();

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(screen.getByText(/15 likes/)).toBeInTheDocument();
    });

    const likeButton = screen.getByRole("button", { name: /like/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(blogService.default.update).toHaveBeenCalledWith("123", {
        ...sampleBlog,
        likes: 16,
      });
    });
  });

  test("clicking remove button shows confirmation and deletes blog", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);
    blogService.default.remove = vi.fn().mockResolvedValue();

    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /remove/i })
      ).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Remove blog Testing React Router by Test Author?"
    );

    await waitFor(() => {
      // react-query may pass an extra second argument (mutation object),
      // so assert the first argument passed to the mocked remove function is the id.
      expect(blogService.default.remove).toHaveBeenCalled();
      expect(blogService.default.remove.mock.calls[0][0]).toBe("123");
    });
  });

  test("does not delete blog if user cancels confirmation", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);
    blogService.default.remove = vi.fn().mockResolvedValue();

    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /remove/i })
      ).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(blogService.default.remove).not.toHaveBeenCalled();
  });

  test("renders comments section", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /comments/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("add a comment...")).toBeInTheDocument();
  });

  test("url link has correct attributes", async () => {
    blogService.default.getOne = vi.fn().mockResolvedValue(sampleBlog);

    render(<BlogView user={currentUser} />, {
      wrapper: createWrapper("123"),
    });

    await waitFor(() => {
      const link = screen.getByRole("link", { name: sampleBlog.url });
      expect(link).toHaveAttribute("href", sampleBlog.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});

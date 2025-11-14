import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Blog from "./Blog";
import userEvent from "@testing-library/user-event";
import * as blogService from "../services/blogs";

vi.mock("../services/blogs");

describe("Blog component", () => {
  const sampleBlog = {
    id: "abc123",
    title: "Testing React components",
    author: "Tester",
    url: "http://example.com",
    likes: 7,
    user: { username: "tester", name: "Test User" },
  };

  test("renders title and author but hides details initially", () => {
    render(<Blog blog={sampleBlog} />);
    expect(screen.getByText(/Testing React components/)).toBeInTheDocument();
    expect(screen.queryByText(/example.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/likes/)).not.toBeInTheDocument();
  });

  test("displays details after clicking view button", async () => {
    render(<Blog blog={sampleBlog} />);
    const user = userEvent.setup();
    const viewButton = screen.getByRole("button", { name: /view/i });

    // Details should be hidden initially
    expect(screen.queryByText(/example.com/)).not.toBeInTheDocument();

    // Click view button
    await user.click(viewButton);

    // Details should now be visible
    expect(screen.getByText(/example.com/)).toBeInTheDocument();
    expect(screen.getByText(/likes/)).toBeInTheDocument();
  });

  test("Clicking the like button twice results in the event handler being called twice", async () => {
    const onUpdated = vi.fn();
    const user = userEvent.setup();

    // Mock the blogService.update to return a blog with incremented likes
    blogService.default.update = vi.fn().mockResolvedValue({
      ...sampleBlog,
      likes: sampleBlog.likes + 1,
    });

    render(<Blog blog={sampleBlog} onUpdated={onUpdated} />);

    // First need to show details to see the like button
    const viewButton = screen.getByRole("button", { name: /view/i });
    await user.click(viewButton);

    // Click like button twice
    const likeButton = screen.getByRole("button", { name: /like/i });
    await user.click(likeButton);
    await user.click(likeButton);

    expect(onUpdated).toHaveBeenCalledTimes(2);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Blog from "./Blog";
import { MemoryRouter } from "react-router-dom";

describe("Blog component", () => {
  const sampleBlog = {
    id: "abc123",
    title: "Testing React components",
    author: "Tester",
    url: "http://example.com",
    likes: 7,
    user: { username: "tester", name: "Test User" },
  };

  test("renders title and author as a link", () => {
    render(
      <MemoryRouter>
        <Blog blog={sampleBlog} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Testing React components Tester");
    expect(link).toHaveAttribute("href", "/blogs/abc123");
  });

  test("does not display blog details in the list view", () => {
    render(
      <MemoryRouter>
        <Blog blog={sampleBlog} />
      </MemoryRouter>
    );

    // URL, likes, and other details should not be visible
    expect(screen.queryByText(/example.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/likes/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /like/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /view/i })
    ).not.toBeInTheDocument();
  });
});

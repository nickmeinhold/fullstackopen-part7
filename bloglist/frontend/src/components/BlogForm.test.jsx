import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import BlogForm from "./BlogForm";
import userEvent from "@testing-library/user-event";

test("<BlogForm /> calls onCreate with form data when submitted", async () => {
  const onCreate = vi.fn();
  const user = userEvent.setup();

  render(<BlogForm onCreate={onCreate} />);

  const titleInput = screen.getByLabelText("title");
  const authorInput = screen.getByLabelText("author");
  const urlInput = screen.getByLabelText("url");
  const createButton = screen.getByText("create");

  await user.type(titleInput, "Test Blog");
  await user.type(authorInput, "Test Author");
  await user.type(urlInput, "http://example.com");
  await user.click(createButton);

  expect(onCreate.mock.calls).toHaveLength(1);
  expect(onCreate).toHaveBeenCalledWith({
    title: "Test Blog",
    author: "Test Author",
    url: "http://example.com",
  });
});

import { test, expect } from "@playwright/test";
import { loginWith, createBlog } from "./helpers";

test.describe("Comments", () => {
  test.beforeEach(async ({ page, request }) => {
    // Empty the database
    await request.post("http://localhost:3001/api/testing/reset");

    // Create a test user
    await request.post("http://localhost:3001/api/users", {
      data: {
        username: "testuser",
        password: "password123",
        name: "Test User",
      },
    });

    await page.goto("http://localhost:5173");

    // Login
    await loginWith(page, "testuser", "password123");

    // Create a test blog
    await createBlog(page, {
      title: "Test Blog for Comments",
      author: "Test Author",
      url: "http://example.com/test",
    });

    // Navigate to the blog view
    await page.getByTestId("blog-title-author").click();
    await expect(
      page.getByRole("heading", { name: /Test Blog for Comments/ })
    ).toBeVisible();
  });

  test("comments section is displayed", async ({ page }) => {
    // Check that comments heading exists
    await expect(
      page.getByRole("heading", { name: "comments", exact: true })
    ).toBeVisible();

    // Check that comment form exists
    await expect(page.getByPlaceholder("add a comment...")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "add comment" })
    ).toBeVisible();
  });

  test("shows 'No comments yet' when there are no comments", async ({
    page,
  }) => {
    await expect(page.getByText("No comments yet")).toBeVisible();
  });

  test("user can add a comment", async ({ page }) => {
    const commentText = "This is a great blog post!";

    // Fill in the comment
    await page.getByPlaceholder("add a comment...").fill(commentText);

    // Submit the comment
    await page.getByRole("button", { name: "add comment" }).click();

    // Wait for notification
    await expect(page.getByText("comment added")).toBeVisible({
      timeout: 5000,
    });

    // Check that the comment appears in the list
    await expect(page.getByText(commentText)).toBeVisible();

    // Check that "No comments yet" is no longer visible
    await expect(page.getByText("No comments yet")).not.toBeVisible();
  });

  test("user can add multiple comments", async ({ page }) => {
    const comments = [
      "First comment",
      "Second comment",
      "Third comment is the best!",
    ];

    for (const commentText of comments) {
      await page.getByPlaceholder("add a comment...").fill(commentText);
      await page.getByRole("button", { name: "add comment" }).click();
      await expect(page.getByText(commentText)).toBeVisible({ timeout: 5000 });
    }

    // All comments should be visible
    for (const commentText of comments) {
      await expect(page.getByText(commentText)).toBeVisible();
    }
  });

  test("comment input is cleared after adding a comment", async ({ page }) => {
    const commentText = "Test comment";

    // Fill and submit
    const input = page.getByPlaceholder("add a comment...");
    await input.fill(commentText);
    await page.getByRole("button", { name: "add comment" }).click();

    // Wait for the comment to be added
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 5000 });

    // Input should be empty
    await expect(input).toHaveValue("");
  });

  test("empty comments cannot be submitted", async ({ page }) => {
    // Try to submit empty comment
    await page.getByRole("button", { name: "add comment" }).click();

    // Should still show "No comments yet"
    await expect(page.getByText("No comments yet")).toBeVisible();
  });

  test("comments persist when navigating back to blog", async ({ page }) => {
    const commentText = "This comment should persist";

    // Add a comment
    await page.getByPlaceholder("add a comment...").fill(commentText);
    await page.getByRole("button", { name: "add comment" }).click();
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 5000 });

    // Navigate back to home
    await page.getByRole("link", { name: "blogs" }).click();
    await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();

    // Navigate back to blog
    await page.getByTestId("blog-title-author").click();
    await expect(
      page.getByRole("heading", { name: /Test Blog for Comments/ })
    ).toBeVisible();

    // Comment should still be visible
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test("comments are displayed in a list", async ({ page }) => {
    const comments = ["First", "Second", "Third"];

    // Add multiple comments
    for (const commentText of comments) {
      await page.getByPlaceholder("add a comment...").fill(commentText);
      await page.getByRole("button", { name: "add comment" }).click();
      await page.waitForTimeout(500); // Small delay between comments
    }

    // Wait for the last comment
    await expect(page.getByText("Third")).toBeVisible({ timeout: 5000 });

    // Check that comments are in a list (ul element)
    const commentsList = page.locator("ul li");
    await expect(commentsList).toHaveCount(3);
  });
});

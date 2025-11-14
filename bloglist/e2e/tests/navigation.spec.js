import { test, expect } from "@playwright/test";
import { loginWith, createBlog } from "./helpers";

test.describe("Navigation", () => {
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
  });

  test("navigation menu is shown after login", async ({ page }) => {
    // Check that navigation links are visible
    await expect(page.getByRole("link", { name: "blogs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "users" })).toBeVisible();

    // Check that user info is displayed
    await expect(page.getByText("Test User logged in")).toBeVisible();

    // Check that logout button is visible
    await expect(page.getByRole("button", { name: "logout" })).toBeVisible();
  });

  test("navigation menu is not shown before login", async ({
    page,
    request,
  }) => {
    // Logout first
    await page.getByRole("button", { name: "logout" }).click();

    // Navigation should not be visible
    await expect(page.getByRole("link", { name: "blogs" })).not.toBeVisible();
    await expect(page.getByRole("link", { name: "users" })).not.toBeVisible();
  });

  test("clicking blogs link navigates to home page", async ({ page }) => {
    // Create a blog first
    await createBlog(page, {
      title: "Test Blog",
      author: "Test Author",
      url: "http://example.com",
    });

    // Navigate to the blog view
    await page.getByTestId("blog-title-author").click();
    await expect(page).toHaveURL(/\/blogs\/.+/);

    // Click blogs link in navigation
    await page.getByRole("link", { name: "blogs" }).click();

    // Should be back on home page
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();
  });

  test("clicking users link navigates to users page", async ({ page }) => {
    // Click users link in navigation
    await page.getByRole("link", { name: "users" }).click();

    // Should navigate to users page
    await expect(page).toHaveURL("http://localhost:5173/users");
  });

  test("logout button works from navigation", async ({ page }) => {
    // Click logout button
    await page.getByRole("button", { name: "logout" }).click();

    // Should show login form
    await expect(page.getByText("log in to application")).toBeVisible();

    // Navigation should not be visible
    await expect(page.getByRole("link", { name: "blogs" })).not.toBeVisible();
  });

  test("navigation persists across page navigation", async ({ page }) => {
    // Create a blog
    await createBlog(page, {
      title: "Test Blog",
      author: "Test Author",
      url: "http://example.com",
    });

    // Navigate to blog view
    await page.getByTestId("blog-title-author").click();
    await expect(page).toHaveURL(/\/blogs\/.+/);

    // Navigation should still be visible
    await expect(page.getByRole("link", { name: "blogs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "users" })).toBeVisible();
    await expect(page.getByText("Test User logged in")).toBeVisible();

    // Go back
    await page.getByRole("link", { name: "blogs" }).click();

    // Navigation should still be visible
    await expect(page.getByRole("link", { name: "blogs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "users" })).toBeVisible();
  });
});

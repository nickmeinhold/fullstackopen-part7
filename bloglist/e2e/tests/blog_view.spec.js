import { test, expect } from "@playwright/test";
import { loginWith } from "./helpers";

// Helper function to create a test blog
const createTestBlog = async (page) => {
  await page.getByRole("button", { name: "create new blog" }).click();
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("React patterns"); // title
  await textboxes.nth(1).fill("Michael Chan"); // author
  await page
    .getByRole("textbox", { name: "url" })
    .fill("https://reactpatterns.com/"); // url
  await page.getByRole("button", { name: "create" }).click();

  // Wait for success notification to appear and disappear
  await expect(page.getByText(/added 'React patterns'/)).toBeVisible({
    timeout: 5000,
  });

  // Wait for the blog card to appear in the list
  await expect(
    page.getByTestId("blog-card").filter({ hasText: "React patterns" })
  ).toBeVisible({ timeout: 10000 });
};

test.describe("Blog View", () => {
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

  test("clicking on a blog title navigates to the blog view", async ({
    page,
  }) => {
    await createTestBlog(page);

    // Click on the blog title link
    await page.getByTestId("blog-title-author").click();

    // Should navigate to the blog's individual page
    await expect(page).toHaveURL(/\/blogs\/.+/);

    // Should display the blog details
    await expect(
      page.getByRole("heading", { name: /React patterns Michael Chan/ })
    ).toBeVisible();
    await expect(page.getByText("https://reactpatterns.com/")).toBeVisible();
    await expect(page.getByText(/0 likes/)).toBeVisible();
    await expect(page.getByText(/added by Test User/)).toBeVisible();
  });

  test("blog view displays correct information", async ({ page }) => {
    await createTestBlog(page);

    // Navigate to blog view
    await page.getByTestId("blog-title-author").click();

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: /React patterns Michael Chan/ })
    ).toBeVisible();

    // Check all expected elements are present
    const link = page.getByRole("link", {
      name: "https://reactpatterns.com/",
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://reactpatterns.com/");
    await expect(link).toHaveAttribute("target", "_blank");

    // Check like button exists
    await expect(page.getByRole("button", { name: "like" })).toBeVisible();

    // Check remove button exists (for creator)
    await expect(page.getByRole("button", { name: "remove" })).toBeVisible();

    // Check comments section
    await expect(
      page.getByRole("heading", { name: /comments/i })
    ).toBeVisible();
  });

  test("can like a blog from the blog view", async ({ page }) => {
    await createTestBlog(page);

    // Navigate to blog view
    await page.getByTestId("blog-title-author").click();

    // Wait for page to load
    await expect(page.getByText(/0 likes/)).toBeVisible();

    // Click like button
    await page.getByRole("button", { name: "like" }).click();

    // Wait for likes to update with a longer timeout
    await expect(page.getByText(/1 likes/)).toBeVisible({ timeout: 10000 });

    // Click like again
    await page.getByRole("button", { name: "like" }).click();

    // Verify likes increased
    await expect(page.getByText(/2 likes/)).toBeVisible({ timeout: 10000 });
  });

  test("can delete a blog from the blog view", async ({ page }) => {
    await createTestBlog(page);

    // Navigate to blog view
    await page.getByTestId("blog-title-author").click();

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: /React patterns/ })
    ).toBeVisible();

    // Set up dialog handler
    page.on("dialog", (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("Remove blog");
      dialog.accept();
    });

    // Click remove button
    await page.getByRole("button", { name: "remove" }).click();

    // Should navigate back to home page after deletion
    await expect(page).toHaveURL("http://localhost:5173/");

    // Blog link should no longer be visible
    await expect(page.getByTestId("blog-title-author")).not.toBeVisible();
  });

  test("non-creator cannot see remove button in blog view", async ({
    page,
    request,
  }) => {
    await createTestBlog(page);

    // Create another user
    await request.post("http://localhost:3001/api/users", {
      data: {
        username: "otheruser",
        password: "password456",
        name: "Other User",
      },
    });

    // Navigate to blog view as creator
    await page.getByTestId("blog-title-author").click();
    await expect(page.getByRole("button", { name: "remove" })).toBeVisible();

    // Get the current URL to navigate back to it
    const blogUrl = page.url();

    // Go back to home
    await page.goto("http://localhost:5173/");

    // Logout
    await page.getByRole("button", { name: "logout" }).click();

    // Login as different user
    await loginWith(page, "otheruser", "password456");

    // Navigate directly to the blog view
    await page.goto(blogUrl);

    // Wait for page to load
    await expect(
      page.getByRole("heading", { name: /React patterns/ })
    ).toBeVisible();

    // Remove button should NOT be visible
    await expect(
      page.getByRole("button", { name: "remove" })
    ).not.toBeVisible();

    // But like button should still be visible
    await expect(page.getByRole("button", { name: "like" })).toBeVisible();
  });

  test("browser back button works from blog view", async ({ page }) => {
    await createTestBlog(page);

    // Navigate to blog view
    await page.getByTestId("blog-title-author").click();

    // Wait for blog view to load
    await expect(
      page.getByRole("heading", { name: /React patterns/ })
    ).toBeVisible();

    // Use browser back button
    await page.goBack();

    // Should be back on the home page
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();
    await expect(page.getByTestId("blog-title-author")).toBeVisible();
  });

  test("can navigate between multiple blog views", async ({ page }) => {
    await createTestBlog(page);

    // Create a second blog
    await page.getByRole("button", { name: "create new blog" }).click();
    const textboxes = page.getByRole("textbox");
    await textboxes.nth(0).fill("Go To Statement Considered Harmful"); // title
    await textboxes.nth(1).fill("Edsger W. Dijkstra"); // author
    await page
      .getByRole("textbox", { name: "url" })
      .fill(
        "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html"
      ); // url
    await page.getByRole("button", { name: "create" }).click();

    // Wait for both blogs to be visible in the list
    await expect(page.getByText(/React patterns.*Michael Chan/)).toBeVisible();
    await expect(page.getByText(/Go To Statement.*Dijkstra/)).toBeVisible();

    // Click on first blog
    const firstBlogLink = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText(/React patterns/) })
      .getByTestId("blog-title-author");
    await firstBlogLink.click();

    // Verify first blog view
    await expect(
      page.getByRole("heading", { name: /React patterns/ })
    ).toBeVisible();
    await expect(page.getByText("https://reactpatterns.com/")).toBeVisible();

    // Go back to home
    await page.goBack();

    // Click on second blog
    const secondBlogLink = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText(/Go To Statement/) })
      .getByTestId("blog-title-author");
    await secondBlogLink.click();

    // Verify second blog view
    await expect(
      page.getByRole("heading", { name: /Go To Statement/ })
    ).toBeVisible();
    await expect(
      page.getByText(/arizona.edu.*Go_To_Considered_Harmful/)
    ).toBeVisible();
  });

  test("blog view handles non-existent blog ID", async ({ page }) => {
    // Navigate to a non-existent blog ID
    await page.goto("http://localhost:5173/blogs/nonexistentid123");

    // Should show loading state first, then error message
    // Wait for the loading state to disappear and error to appear
    await expect(page.getByText("Blog not found")).toBeVisible({
      timeout: 10000,
    });
  });
});

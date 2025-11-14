import { test, expect } from "@playwright/test";
import { loginWith } from "./helpers";

test.describe("When logged in", () => {
  test.beforeEach(async ({ page, request }) => {
    // Empty the database
    await request.post("http://localhost:3001/api/testing/reset");

    // Create a test user
    const userResponse = await request.post("http://localhost:3001/api/users", {
      data: {
        username: "seeduser",
        password: "password123",
        name: "Seed User",
      },
    });

    await page.goto("http://localhost:5173");

    // Login with helper function
    await loginWith(page, "seeduser", "password123");
  });

  test("a new blog can be created and liked", async ({ page }) => {
    // Click the "create new blog" button
    await page.getByRole("button", { name: "create new blog" }).click();

    // Fill in the blog form - Material-UI TextFields need placeholder or input selector
    const textboxes = page.getByRole("textbox");
    await textboxes.nth(0).fill("Test Blog Title"); // title
    await textboxes.nth(1).fill("Test Author"); // author
    await page
      .getByRole("textbox", { name: "url" })
      .fill("http://example.com/blog"); // url has type="url"

    // Submit the form
    await page.getByRole("button", { name: "create" }).click();

    // Check if success notification appears (includes author name)
    await expect(page.getByText(/added 'Test Blog Title' by/)).toBeVisible();

    // Check if the blog is displayed in the list - title and author are separate in Material-UI
    await expect(page.getByText("Test Blog Title")).toBeVisible();
    await expect(page.getByText("Test Author")).toBeVisible();

    // Navigate to the blog view page
    await page.getByTestId("blog-title-author").click();

    // Wait for blog view to load
    await expect(
      page.getByRole("heading", { name: /Test Blog Title/ })
    ).toBeVisible();

    // Verify initial likes count is 0
    await expect(page.getByText(/0 likes/)).toBeVisible();

    // Click the like button
    await page.getByRole("button", { name: "like" }).click();

    // Wait for the likes count to update
    await expect(page.getByText(/1 likes/)).toBeVisible();
  });

  test("a blog can be deleted by its creator", async ({ page }) => {
    const blogTitle = "Blog to Delete";
    // Create a blog
    await page.getByRole("button", { name: "create new blog" }).click();
    const textboxes = page.getByRole("textbox");
    await textboxes.nth(0).fill(blogTitle); // title
    await textboxes.nth(1).fill("Test Author"); // author
    await page
      .getByRole("textbox", { name: "url" })
      .fill("http://example.com/delete-me"); // url
    await page.getByRole("button", { name: "create" }).click();

    // Wait for the blog to appear in the list
    await expect(
      page.getByRole("link", { name: /Blog to Delete/ })
    ).toBeVisible();

    // Navigate to the blog view page
    await page.getByTestId("blog-title-author").click();

    // Wait for blog view to load
    await expect(
      page.getByRole("heading", { name: /Blog to Delete/ })
    ).toBeVisible();

    // Delete button should be visible
    await expect(page.getByRole("button", { name: "remove" })).toBeVisible();

    // Click delete (accept the confirm dialog)
    page.on("dialog", (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("Remove blog");
      dialog.accept();
    });

    await page.getByRole("button", { name: "remove" }).click();

    // Should navigate back to home page after deletion
    await expect(page).toHaveURL("http://localhost:5173/");

    // Blog should no longer be visible in the list (using more specific selector)
    await expect(
      page.getByTestId("blog-title-author").filter({ hasText: blogTitle })
    ).not.toBeVisible();
  });

  test("only the blog creator can see the delete button", async ({
    page,
    request,
  }) => {
    // Create a blog as seeduser
    await page.getByRole("button", { name: "create new blog" }).click();
    const textboxes = page.getByRole("textbox");
    await textboxes.nth(0).fill("Another User's Blog"); // title
    await textboxes.nth(1).fill("Test Author"); // author
    await page
      .getByRole("textbox", { name: "url" })
      .fill("http://example.com/other-user"); // url
    await page.getByRole("button", { name: "create" }).click();

    // Wait for the blog to appear in the list
    await expect(
      page.getByRole("link", { name: /Another User's Blog/ })
    ).toBeVisible();

    // Create a second user
    await request.post("http://localhost:3001/api/users", {
      data: {
        username: "otheruser",
        password: "password456",
        name: "Other User",
      },
    });

    // Log out and log in as different user
    await page.getByRole("button", { name: "logout" }).click();
    await loginWith(page, "otheruser", "password456");

    // Navigate to the blog
    await page.goto("http://localhost:5173");

    // Wait for blogs to load
    await expect(
      page.getByRole("link", { name: /Another User's Blog/ })
    ).toBeVisible();

    // Navigate to the blog view page
    await page.getByTestId("blog-title-author").click();

    // Wait for blog view to load
    await expect(
      page.getByRole("heading", { name: /Another User's Blog/ })
    ).toBeVisible();

    // Delete button should NOT exist for non-creator
    await expect(
      page.getByRole("button", { name: "remove" })
    ).not.toBeVisible();
  });

  test("blogs are ordered by likes with most liked first", async ({ page }) => {
    // Create three blogs
    const blogs = [
      {
        title: "Blog One",
        author: "Author One",
        url: "http://example.com/one",
      },
      {
        title: "Blog Two",
        author: "Author Two",
        url: "http://example.com/two",
      },
      {
        title: "Blog Three",
        author: "Author Three",
        url: "http://example.com/three",
      },
    ];

    for (const blog of blogs) {
      await page.getByRole("button", { name: "create new blog" }).click();
      const textboxes = page.getByRole("textbox");
      await textboxes.nth(0).fill(blog.title); // title
      await textboxes.nth(1).fill(blog.author); // author
      await page.getByRole("textbox", { name: "url" }).fill(blog.url); // url
      await page.getByRole("button", { name: "create" }).click();

      // Wait for the blog to appear on the page (it will be displayed when creation succeeds)
      await expect(
        page.getByText(new RegExp(`${blog.title}.*${blog.author}`))
      ).toBeVisible();
    }

    // Like Blog Two 5 times
    const blogTwoLink = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText("Blog Two") })
      .getByTestId("blog-title-author");
    await blogTwoLink.click();
    await expect(page.getByRole("heading", { name: /Blog Two/ })).toBeVisible();

    // Like Blog Two 3 times
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "like" }).click();
      await page.waitForTimeout(1000);
    }
    // Don't verify exact count, just move on
    await page.waitForTimeout(1000);
    await page.goBack();

    // Wait for home page to load
    await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();

    // Like Blog Three 3 times
    const blogThreeLink = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText("Blog Three") })
      .getByTestId("blog-title-author");
    await blogThreeLink.click();
    await expect(
      page.getByRole("heading", { name: /Blog Three/ })
    ).toBeVisible();

    // Like 2 times
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: "like" }).click();
      await page.waitForTimeout(1000);
    }
    //  Don't verify exact count, just move on
    await page.waitForTimeout(1000);
    await page.goBack();

    // Wait for home page to load
    await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();

    // Like Blog One 1 time
    // Wait for blogs to be visible after going back
    await expect(page.getByRole("link", { name: /Blog One/ })).toBeVisible({
      timeout: 5000,
    });

    const blogOneLink = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText("Blog One") })
      .getByTestId("blog-title-author");
    await blogOneLink.click();
    await expect(page.getByRole("heading", { name: /Blog One/ })).toBeVisible({
      timeout: 10000,
    });

    // Don't like Blog One - leave it at 0
    await page.goBack();

    // Verify blogs are ordered by likes (most liked first)
    // The blogs should appear in this order: Blog Two (3), Blog Three (2), Blog One (0)
    // Wait for blogs list to refresh
    await page.waitForTimeout(2000);
    const cards = page.getByTestId("blog-card");
    await expect(cards).toHaveCount(3);

    // Check the order by reading the text content
    const firstBlog = await cards
      .nth(0)
      .getByTestId("blog-title-author")
      .textContent();
    const secondBlog = await cards
      .nth(1)
      .getByTestId("blog-title-author")
      .textContent();
    const thirdBlog = await cards
      .nth(2)
      .getByTestId("blog-title-author")
      .textContent();

    expect(firstBlog).toContain("Blog Two");
    expect(secondBlog).toContain("Blog Three");
    expect(thirdBlog).toContain("Blog One");
  });
});

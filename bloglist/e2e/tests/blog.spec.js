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

    // Fill in the blog form
    await page.getByLabel("title").fill("Test Blog Title");
    await page.getByLabel("author").fill("Test Author");
    await page.getByLabel("url").fill("http://example.com/blog");

    // Submit the form
    await page.getByRole("button", { name: "create" }).click();

    // Check if success notification appears
    await expect(page.getByText(/added 'Test Blog Title'/)).toBeVisible();

    // Check if the blog is displayed
    await expect(page.getByText("Test Blog Title Test Author")).toBeVisible();

    // Expand the blog using test-id based selector
    await page.getByTestId("blog-card").getByTestId("toggle-details").click();

    // Get the initial likes count via test-id
    const likesBeforeText =
      (await page.getByTestId("likes-count").textContent()) || "0";
    const initialLikes = parseInt(likesBeforeText.trim(), 10);

    // Click the like button via test-id
    await page.getByTestId("like-button").click();

    // Wait for the likes count to update via test-id
    await expect(page.getByTestId("likes-count")).toHaveText(
      String(initialLikes + 1)
    );

    // Get the updated likes count
    const likesAfterText =
      (await page.getByTestId("likes-count").textContent()) || "0";
    const updatedLikes = parseInt(likesAfterText.trim(), 10);

    // Verify the likes increased by 1
    expect(updatedLikes).toBe(initialLikes + 1);
  });

  test("a blog can be deleted by its creator", async ({ page }) => {
    const blogTitle = "Blog to Delete";
    // Create a blog
    await page.getByRole("button", { name: "create new blog" }).click();
    await page.getByLabel("title").fill(blogTitle);
    await page.getByLabel("author").fill("Test Author");
    await page.getByLabel("url").fill("http://example.com/delete-me");
    await page.getByRole("button", { name: "create" }).click();

    // Wait for success notification
    await expect(page.getByText(/added 'Blog to Delete'/)).toBeVisible();

    // View the blog details
    await page.getByTestId("blog-card").getByTestId("toggle-details").click();

    // Delete button should be visible
    await expect(page.getByTestId("delete-button")).toBeVisible();

    // Click delete (dismiss the confirm dialog)
    page.on("dialog", (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toBe(`Are you sure you want to delete?`);
      dialog.accept();
    });

    await page.getByTestId("delete-button").click();

    // Wait for the blog to be completely removed from the DOM
    await page
      .locator("div", { has: page.getByText(blogTitle) })
      .first()
      .waitFor({ state: "hidden" });
  });

  test("only the blog creator can see the delete button", async ({
    page,
    request,
  }) => {
    // Create a blog as seeduser
    await page.getByRole("button", { name: "create new blog" }).click();
    await page.getByLabel("title").fill("Another User's Blog");
    await page.getByLabel("author").fill("Test Author");
    await page.getByLabel("url").fill("http://example.com/other-user");
    await page.getByRole("button", { name: "create" }).click();

    // Wait for success notification
    await expect(page.getByText(/added 'Another User's Blog'/)).toBeVisible();

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
    await expect(page.getByText(/Another User's Blog/)).toBeVisible();

    // View the blog details
    await page.getByTestId("blog-card").getByTestId("toggle-details").click();

    // Delete button should NOT exist for non-creator
    await expect(page.getByTestId("delete-button")).toHaveCount(0);
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
      await page.getByLabel("title").fill(blog.title);
      await page.getByLabel("author").fill(blog.author);
      await page.getByLabel("url").fill(blog.url);
      await page.getByRole("button", { name: "create" }).click();

      // Wait for the blog to appear on the page (it will be displayed when creation succeeds)
      await expect(
        page.getByText(new RegExp(`${blog.title}.*${blog.author}`))
      ).toBeVisible();
    }

    // Like Blog Two 5 times
    const blogTwoSection = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText(/^Blog Two Author Two$/) });
    await blogTwoSection.getByTestId("toggle-details").click();
    for (let i = 0; i < 5; i++) {
      await page.getByTestId("like-button").click();
      await expect(page.getByTestId("likes-count")).toHaveText(String(i + 1));
    }
    await blogTwoSection.getByTestId("toggle-details").click();

    // Like Blog Three 3 times
    const blogThreeSection = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText(/^Blog Three Author Three$/) });
    await blogThreeSection.getByTestId("toggle-details").click();
    for (let i = 0; i < 3; i++) {
      await page.getByTestId("like-button").click();
      await expect(page.getByTestId("likes-count")).toHaveText(String(i + 1));
    }
    await blogThreeSection.getByTestId("toggle-details").click();

    // Like Blog One 1 time
    const blogOneSection = page
      .getByTestId("blog-card")
      .filter({ has: page.getByText(/^Blog One Author One$/) });
    await blogOneSection.getByTestId("toggle-details").click();
    await page.getByTestId("like-button").click();
    await expect(page.getByTestId("likes-count")).toHaveText("1");
    await blogOneSection.getByTestId("toggle-details").click();

    // Reload the page to trigger fresh sorting in UI
    await page.reload();
    // Wait for blogs to load after reload
    await expect(page.getByTestId("blog-card").first()).toBeVisible();
    // Optional: ensure all three blogs are present
    await expect(page.getByTestId("blog-card")).toHaveCount(3);

    // Collect all blog cards (collapsed after reload)
    const cards = page.getByTestId("blog-card");
    const cardCount = await cards.count();
    const collected = [];

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      // Expand details to read likes
      await card.getByTestId("toggle-details").click();
      const titleEl = card.getByTestId("blog-title-author");
      const likesEl = card.getByTestId("likes-count");
      await expect(titleEl).toBeVisible();
      await expect(likesEl).toBeVisible();
      const titleAuthorText = (await titleEl.textContent()) || "";
      const likesText = (await likesEl.textContent()) || "0";
      const likes = parseInt(likesText.trim(), 10);
      collected.push({ titleAuthorText: titleAuthorText.trim(), likes });
      // Collapse again (optional, keeps UI tidy)
      await card.getByTestId("toggle-details").click();
    }

    // Assert we collected expected titles
    const titles = collected.map((c) => c.titleAuthorText);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Blog Two Author Two",
        "Blog Three Author Three",
        "Blog One Author One",
      ])
    );

    // Sort a copy descending by likes and compare to original order
    const byLikesDesc = [...collected].sort((a, b) => b.likes - a.likes);
    expect(collected.map((c) => c.titleAuthorText)).toEqual(
      byLikesDesc.map((c) => c.titleAuthorText)
    );

    // Explicit like count assertions for determinism
    const lookup = Object.fromEntries(
      collected.map((c) => [c.titleAuthorText, c.likes])
    );
    expect(lookup["Blog Two Author Two"]).toBe(5);
    expect(lookup["Blog Three Author Three"]).toBe(3);
    expect(lookup["Blog One Author One"]).toBe(1);
  });
});

import { test, expect } from "@playwright/test";
import { loginWith } from "./helpers";

test.describe("Blog app", () => {
  test.beforeEach(async ({ page, request }) => {
    // Empty the database
    await request.post("http://localhost:3001/api/testing/reset");

    // Create a test user
    await request.post("http://localhost:3001/api/users", {
      data: {
        username: "seeduser",
        password: "password123",
        name: "Seed User",
      },
    });

    await page.goto("http://localhost:5173");
  });

  test("Login form is shown", async ({ page }) => {
    console.log("Test: checking for login form text");
    await expect(page.getByText("log in to application")).toBeVisible();
    console.log("Test: login form found!");
  });

  test("succeeds with correct credentials", async ({ page }) => {
    await loginWith(page, "seeduser", "password123");

    // After successful login, check if we see the app content
    await expect(page.getByText("blogs")).toBeVisible();
    await expect(page.getByText("Seed User logged in")).toBeVisible();
  });

  test("fails with wrong credentials", async ({ page }) => {
    const usernameInput = page.getByLabel("username");
    const passwordInput = page.getByLabel("password");
    const loginButton = page.getByRole("button", { name: "login" });

    await usernameInput.fill("wronguser");
    await passwordInput.fill("wrongpassword");
    await loginButton.click();

    // After failed login, check if error message appears
    await expect(page.getByText(/invalid username/i)).toBeVisible();
  });
});

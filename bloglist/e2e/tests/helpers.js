export async function loginWith(page, username, password) {
  const usernameInput = page.getByLabel("username");
  const passwordInput = page.getByLabel("password");
  const loginButton = page.getByRole("button", { name: "login" });

  await usernameInput.fill(username);
  await passwordInput.fill(password);
  await loginButton.click();

  // Wait for login to complete - look for the logout button instead
  await page.getByRole("button", { name: "logout" }).waitFor();
}

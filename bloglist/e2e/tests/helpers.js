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

export async function createBlog(page, { title, author, url }) {
  await page.getByRole("button", { name: "create new blog" }).click();
  // Material-UI TextFields - select by role
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill(title); // title
  await textboxes.nth(1).fill(author); // author
  await page.getByRole("textbox", { name: "url" }).fill(url); // url has type="url"
  await page.getByRole("button", { name: "create" }).click();

  // Wait for the blog to appear in the list
  await page.getByRole("link", { name: new RegExp(title) }).waitFor();
}

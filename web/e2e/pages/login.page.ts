// e2e/pages/login.page.ts
import { type Locator, type Page } from "@reearth-cms/e2e/fixtures/test";

export class LoginPage {
  // Custom login form elements
  emailInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;

  // Auth0 login form elements
  auth0EmailInput: Locator;
  auth0PasswordInput: Locator;
  auth0ContinueButton: Locator;
  auth0SkipPasskeyButton: Locator;

  // User menu elements (for logout)
  userMenuLink: Locator;
  logoutButton: Locator;

  constructor(private page: Page) {
    // Custom login form
    this.emailInput = this.page.getByPlaceholder("username/email");
    this.passwordInput = this.page.getByPlaceholder("your password");
    this.loginButton = this.page.getByText("LOG IN");

    // Auth0 login form
    this.auth0EmailInput = this.page.getByRole("textbox", { name: "Email address", exact: true });
    this.auth0PasswordInput = this.page.getByRole("textbox", { name: "Password", exact: true });
    this.auth0ContinueButton = this.page.getByRole("button", { name: "Continue", exact: true });
    this.auth0SkipPasskeyButton = this.page.getByRole("button", {
      name: "Continue without passkeys",
    });

    // User menu
    this.userMenuLink = this.page.locator("a").nth(1);
    this.logoutButton = this.page.getByText("Logout");
  }

  async login(email: string, password: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithAuth0(email: string, password: string) {
    // Email input
    await this.auth0EmailInput.click();
    await this.auth0EmailInput.fill(email);
    await this.auth0ContinueButton.click();
    await this.page.waitForLoadState("networkidle");

    // Password input
    await this.auth0PasswordInput.click();
    await this.auth0PasswordInput.fill(password);
    await this.auth0ContinueButton.click();
    await this.page.waitForLoadState("networkidle");

    // Handle optional passkey prompt
    if (await this.auth0SkipPasskeyButton.isVisible()) {
      await this.auth0SkipPasskeyButton.click();
    }
  }
}

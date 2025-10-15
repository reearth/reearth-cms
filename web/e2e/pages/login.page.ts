// e2e/pages/login.page.ts
import { type Locator, type Page } from "@playwright/test";

export class LoginPage {
  // Login form elements
  emailInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;

  // User menu elements (for logout)
  userMenuLink: Locator;
  logoutButton: Locator;

  constructor(private page: Page) {
    // Initialize login form locators
    this.emailInput = this.page.getByLabel("Email address");
    this.passwordInput = this.page.getByLabel("Password");
    this.loginButton = this.page.getByRole("button", { name: "Continue", exact: true });

    // Initialize user menu locators
    this.userMenuLink = this.page.locator("a").nth(1);
    this.logoutButton = this.page.getByText("Logout");
  }

  async login(email: string, password: string) {
    // Check if it's the new UI or old UI
    const isNewUI = await this.emailInput.isVisible();

    if (isNewUI) {
      // New UI login flow
      await this.emailInput.clear();
      await this.emailInput.fill(email);
      await this.loginButton.click();

      // Wait for password field to appear
      await this.passwordInput.waitFor({ state: "visible" });
      await this.passwordInput.clear();
      await this.passwordInput.fill(password);
      await this.loginButton.click();

      // Handle "Continue without passkeys" if it appears
      const withoutPasskeyButton = this.page.getByRole("button", { name: "Continue without passkeys" });
      try {
        await withoutPasskeyButton.waitFor({ state: "visible", timeout: 3000 });
        await withoutPasskeyButton.click();
      } catch {
        // Button didn't appear, continue
      }
    } else {
      // Old UI login flow
      await this.page.getByPlaceholder("username/email").click();
      await this.page.getByPlaceholder("username/email").fill(email);
      await this.page.getByPlaceholder("your password").click();
      await this.page.getByPlaceholder("your password").fill(password);
      await this.page.getByText("LOG IN").click();
    }
  }
}

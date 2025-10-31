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
    this.emailInput = this.page.getByPlaceholder("username/email");
    this.passwordInput = this.page.getByPlaceholder("your password");
    this.loginButton = this.page.getByText("LOG IN");

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
}

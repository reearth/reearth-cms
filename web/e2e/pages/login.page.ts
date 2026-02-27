// e2e/pages/login.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  // Custom login form
  private get emailInput(): Locator {
    return this.getByPlaceholder("username/email");
  }
  private get passwordInput(): Locator {
    return this.getByPlaceholder("your password");
  }
  private get loginButton(): Locator {
    return this.getByText("LOG IN");
  }

  // Auth0 login form
  public get auth0EmailInput(): Locator {
    return this.getByLabel("Email address");
  }
  private get auth0PasswordInput(): Locator {
    return this.getByLabel("Password").first();
  }
  private get auth0ContinueButton(): Locator {
    return this.getByRole("button", { name: "Continue", exact: true });
  }
  private get auth0SkipPasskeyButton(): Locator {
    return this.getByRole("button", { name: "Continue without passkeys" });
  }

  // User menu
  public get userMenuLink(): Locator {
    return this.locator("a").nth(1);
  }
  public get logoutButton(): Locator {
    return this.getByText("Logout");
  }

  // goto(), expectURL() inherited from BasePage

  public async login(email: string, password: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  public async loginWithAuth0(email: string, password: string) {
    await this.auth0EmailInput.click();
    await this.auth0EmailInput.fill(email);
    await this.auth0ContinueButton.click();
    await this.auth0PasswordInput.click();
    await this.auth0PasswordInput.fill(password);
    await this.auth0ContinueButton.click();

    // Handle optional passkey prompt
    if (await this.auth0SkipPasskeyButton.isVisible()) {
      await this.auth0SkipPasskeyButton.click();
    }
  }
}

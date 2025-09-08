import { Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class SettingsPage extends BasePage {
  get generalTab(): Locator {
    return this.getByText("General");
  }

  get integrationsTab(): Locator {
    return this.getByText("Integrations");
  }

  get membersTab(): Locator {
    return this.getByText("Members");
  }

  get saveChangesButton(): Locator {
    return this.getByRole("button", { name: "Save changes" });
  }

  // General settings
  get languageSelect(): Locator {
    return this.locator(".ant-select-selector").first();
  }

  // Member settings
  get inviteButton(): Locator {
    return this.getByRole("button", { name: "Invite" });
  }

  get emailInput(): Locator {
    return this.getByLabel("Email");
  }

  get roleSelect(): Locator {
    return this.locator(".ant-select-selector");
  }

  // Integration settings
  get webhookUrlInput(): Locator {
    return this.getByLabel("Webhook URL");
  }

  get secretInput(): Locator {
    return this.getByLabel("Secret");
  }

  get activeCheckbox(): Locator {
    return this.getByRole("checkbox", { name: "Active" });
  }

  get testButton(): Locator {
    return this.getByRole("button", { name: "Test" });
  }

  get deleteButton(): Locator {
    return this.getByRole("button", { name: "delete" });
  }

  async navigateToGeneral(): Promise<void> {
    await this.generalTab.click();
  }

  async navigateToIntegrations(): Promise<void> {
    await this.integrationsTab.click();
  }

  async navigateToMembers(): Promise<void> {
    await this.membersTab.click();
  }

  async saveChanges(): Promise<void> {
    await this.saveChangesButton.click();
    await this.closeNotification();
  }

  // General settings methods
  async changeLanguage(language: string): Promise<void> {
    await this.languageSelect.click();
    await this.getByText(language).click();
  }

  // Member management methods
  async inviteMember(email: string, role = "Reader"): Promise<void> {
    await this.inviteButton.click();
    await this.emailInput.fill(email);
    await this.roleSelect.click();
    await this.getByText(role).click();
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async removeMember(memberEmail: string): Promise<void> {
    const memberRow = this.getByText(memberEmail).locator("..").locator("..");
    await memberRow.getByRole("button", { name: "delete" }).click();
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  async changeMemberRole(memberEmail: string, newRole: string): Promise<void> {
    const memberRow = this.getByText(memberEmail).locator("..").locator("..");
    await memberRow.locator(".ant-select-selector").click();
    await this.getByText(newRole).click();
    await this.saveChanges();
  }

  // Integration methods
  async createWebhook(url: string, secret?: string): Promise<void> {
    await this.getByRole("button", { name: "plus Create" }).click();
    await this.webhookUrlInput.fill(url);
    if (secret) {
      await this.secretInput.fill(secret);
    }
    await this.activeCheckbox.check();
    await this.saveChanges();
  }

  async testWebhook(): Promise<void> {
    await this.testButton.click();
    await this.closeNotification();
  }

  async deleteIntegration(): Promise<void> {
    await this.deleteButton.click();
    await this.getByRole("button", { name: "OK" }).click();
    await this.closeNotification();
  }

  // Tiles management methods
  async addTilesOption(optionType = "Default"): Promise<void> {
    await this.getByRole("button", { name: "plus Add new Tiles option" }).click();
    if (optionType !== "Default") {
      await this.locator("div")
        .filter({ hasText: /^Default$/ })
        .nth(4)
        .click();
      await this.getByTitle(optionType).click();
    }
    await this.getByRole("button", { name: "OK" }).click();
  }

  async configureTileUrl(name: string, url: string, imageUrl?: string): Promise<void> {
    await this.locator("div")
      .filter({ hasText: /^Labelled$/ })
      .nth(4)
      .click();
    await this.getByTitle("URL").locator("div").click();
    await this.getByLabel("Name").fill(name);
    await this.getByRole("textbox", { name: "URL :", exact: true }).fill(url);
    if (imageUrl) {
      await this.getByLabel("Image URL").fill(imageUrl);
    }
    await this.getByRole("button", { name: "OK" }).click();
  }

  async editTileOption(index = 0): Promise<void> {
    await this.locator(
      `div:nth-child(${index + 1}) > .ant-card-actions > li:nth-child(2) > span > .anticon`,
    ).click();
  }

  async deleteTileOption(index = 0): Promise<void> {
    await this.locator(
      `div:nth-child(${index + 1}) > .ant-card-actions > li:nth-child(1) > span > .anticon`,
    ).click();
  }

  async saveTileSettings(): Promise<void> {
    await this.getByRole("button", { name: "Save" }).click();
    await this.closeNotification();
  }

  // Terrain management methods
  async addTerrainOption(optionType = "Cesium World Terrain"): Promise<void> {
    await this.getByRole("button", { name: "plus Add new Terrain option" }).click();
    if (optionType !== "Cesium World Terrain") {
      await this.locator("div")
        .filter({ hasText: /^Cesium World Terrain$/ })
        .nth(4)
        .click();
      await this.getByTitle(optionType).click();
    }
    await this.getByRole("button", { name: "OK" }).click();
  }

  async configureTerrainCesiumIon(
    name: string,
    assetId: string,
    accessToken: string,
    terrainUrl?: string,
    imageUrl?: string,
  ): Promise<void> {
    await this.locator("div")
      .filter({ hasText: /^ArcGIS Terrain$/ })
      .nth(4)
      .click();
    await this.getByTitle("Cesium Ion").click();
    await this.getByLabel("Name").fill(name);
    await this.getByLabel("Terrain Cesium Ion asset ID").fill(assetId);
    await this.getByLabel("Terrain Cesium Ion access").fill(accessToken);
    if (terrainUrl) {
      await this.getByLabel("Terrain URL").fill(terrainUrl);
    }
    if (imageUrl) {
      await this.getByLabel("Image URL").fill(imageUrl);
    }
    await this.getByRole("button", { name: "OK" }).click();
  }

  async editTerrainOption(): Promise<void> {
    await this.getByLabel("edit").locator("svg").click();
  }

  async deleteTerrainOption(): Promise<void> {
    await this.getByLabel("delete").locator("svg").click();
  }

  async saveTerrainSettings(): Promise<void> {
    await this.getByRole("button", { name: "Save" }).click();
    await this.closeNotification();
  }

  // Card reordering methods
  async reorderCards(fromIndex: number, toIndex: number): Promise<void> {
    await this.locator(".ant-card")
      .nth(fromIndex)
      .locator(".grabbable")
      .dragTo(this.locator(".ant-card").nth(toIndex));
  }

  async navigateHome(): Promise<void> {
    await this.getByText("Home").click();
  }

  async navigateBackToSettings(): Promise<void> {
    await this.getByText("Settings").click();
  }
}

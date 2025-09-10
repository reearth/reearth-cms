// e2e/pages/settings.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";

import { BasePage } from "./base.page";

export class SettingsPage extends BasePage {
  // Navigation
  get settingsMenuItem(): Locator {
    return this.getByText("Settings").first();
  }
  get homeMenuItem(): Locator {
    return this.getByText("Home");
  }

  // Tiles management
  get addNewTilesButton(): Locator {
    return this.getByRole("button", { name: "plus Add new Tiles option" });
  }
  get defaultTileOption(): Locator {
    return this.locator("div").filter({ hasText: /^Default$/ }).nth(4);
  }
  get labelledTileOption(): Locator {
    return this.getByTitle("Labelled");
  }
  get urlTileOption(): Locator {
    return this.getByTitle("URL").locator("div");
  }

  // Terrain management
  get terrainSwitch(): Locator {
    return this.getByRole("switch");
  }
  get addTerrainButton(): Locator {
    return this.getByRole("button", { name: "plus Add new Terrain option" });
  }
  get cesiumWorldTerrainDiv(): Locator {
    return this.locator("div").filter({ hasText: /^Cesium World Terrain$/ }).nth(4);
  }
  get cesiumWorldTerrainOption(): Locator {
    return this.locator("div").filter({ hasText: /^Cesium World Terrain$/ }).nth(4);
  }
  get arcGisTerrainOption(): Locator {
    return this.getByTitle("ArcGIS Terrain");
  }
  get cesiumIonOption(): Locator {
    return this.getByTitle("Cesium Ion");
  }

  // Form inputs
  get nameInput(): Locator {
    return this.getByLabel("Name");
  }
  get urlInput(): Locator {
    return this.getByRole("textbox", { name: "URL :", exact: true });
  }
  get imageUrlInput(): Locator {
    return this.getByLabel("Image URL");
  }
  get terrainAssetIdInput(): Locator {
    return this.getByLabel("Terrain Cesium Ion asset ID");
  }
  get terrainAccessTokenInput(): Locator {
    return this.getByLabel("Terrain Cesium Ion access");
  }
  get terrainUrlInput(): Locator {
    return this.getByLabel("Terrain URL");
  }

  // Card elements
  get cards(): Locator {
    return this.locator(".ant-card");
  }
  cardByIndex(index: number): Locator {
    return this.locator(".ant-card").nth(index);
  }
  get cardBodies(): Locator {
    return this.locator(".ant-card-body");
  }
  get cardMetaAvatarImage(): Locator {
    return this.locator(".ant-card-body .ant-card-meta-avatar > img");
  }
  get grabbableElements(): Locator {
    return this.locator(".grabbable");
  }
  grabbableInCard(cardIndex: number): Locator {
    return this.cardByIndex(cardIndex).locator(".grabbable");
  }

  // Action buttons in cards
  get editCardButton(): Locator {
    return this.locator("div:last-child > .ant-card-actions > li:nth-child(2) > span > .anticon");
  }
  get deleteCardButton(): Locator {
    return this.locator("div:last-child > .ant-card-actions > li:nth-child(1) > span > .anticon");
  }
  get editIconButton(): Locator {
    return this.getByLabel("edit").locator("svg");
  }
  get deleteIconButton(): Locator {
    return this.getByLabel("delete").locator("svg");
  }

  // Common form elements
  get closeButton(): Locator {
    return this.getByLabel("Close", { exact: true }).first();
  }
  get okButton(): Locator {
    return this.getByRole("button", { name: "OK" });
  }
  get saveButton(): Locator {
    return this.getByRole("button", { name: "Save" });
  }
  get formElement(): Locator {
    return this.locator("form");
  }
  
  // Text elements
  textByName(text: string, exact = false): Locator {
    return this.getByText(text, { exact });
  }
  
  // URL input (different from general textbox)
  get urlTextbox(): Locator {
    return this.getByLabel("URL", { exact: true });
  }

  // Account and Language settings
  get accountText(): Locator {
    return this.getByText(/Account|アカウント/);
  }
  get currentLanguageText(): Locator {
    return this.getByText(/Auto|自動|English|日本語/);
  }
  get languageOptionJapanese(): Locator {
    return this.getByTitle("日本語").last();
  }
  get languageOptionEnglish(): Locator {
    return this.getByTitle("English").last();
  }
  languageOptionByTitle(title: string): Locator {
    return this.getByTitle(title).last();
  }
  get formSaveButton(): Locator {
    return this.locator("form").getByRole("button").nth(1);
  }
  get rootElement(): Locator {
    return this.locator("#root");
  }
  get japaneseFirstText(): Locator {
    return this.getByText("日本語").first();
  }
  get englishFirstText(): Locator {
    return this.getByText("English").first();
  }

  // Account management
  get accountNameInput(): Locator {
    return this.getByLabel(/Account Name|アカウント名/);
  }
  get yourEmailInput(): Locator {
    return this.getByLabel(/Your Email|メールアドレス/);
  }
  get accountNameInputExact(): Locator {
    return this.getByLabel("Account Name");
  }
  get yourEmailInputExact(): Locator {
    return this.getByLabel("Your Email");
  }
  get formSubmitButton(): Locator {
    return this.locator("form").getByRole("button").first();
  }
  get headerElement(): Locator {
    return this.locator("header");
  }
}
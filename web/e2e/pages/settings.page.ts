// e2e/pages/settings.page.ts
import { type Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { SettingsScopedPage } from "./settings-scoped.page";

export class SettingsPage extends SettingsScopedPage {
  // Tiles management
  public get addNewTilesButton(): Locator {
    return this.getByRole("button", { name: "plus Add new Tiles option" });
  }
  public get defaultTileOption(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Default$/ })
      .nth(4);
  }
  public get labelledTileOption(): Locator {
    return this.getByTitle("Labelled");
  }
  public get urlTileOption(): Locator {
    return this.getByTitle("URL").locator("div");
  }

  // Terrain management
  public get terrainSwitch(): Locator {
    return this.getByRole("switch");
  }
  public get addTerrainButton(): Locator {
    return this.getByRole("button", { name: "plus Add new Terrain option" });
  }
  public get cesiumWorldTerrainDiv(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Cesium World Terrain$/ })
      .nth(4);
  }
  public get cesiumWorldTerrainOption(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Cesium World Terrain$/ })
      .nth(4);
  }
  public get arcGisTerrainOption(): Locator {
    return this.getByTitle("ArcGIS Terrain");
  }
  public get cesiumIonOption(): Locator {
    return this.getByTitle("Cesium Ion");
  }

  // Form inputs
  public get nameInput(): Locator {
    return this.getByLabel("Name");
  }
  public get urlInput(): Locator {
    return this.getByLabel("URL").first();
  }
  public get imageUrlInput(): Locator {
    return this.getByLabel("Image URL");
  }
  public get terrainAssetIdInput(): Locator {
    return this.getByLabel("Terrain Cesium Ion asset ID");
  }
  public get terrainAccessTokenInput(): Locator {
    return this.getByLabel("Terrain Cesium Ion access");
  }
  public get terrainUrlInput(): Locator {
    return this.getByLabel("Terrain URL");
  }

  // Card elements
  public cardByIndex(index: number): Locator {
    return this.getByTestId(DATA_TEST_ID.SettingsCard__Wrapper).nth(index);
  }
  public get cardMetaAvatarImage(): Locator {
    return this.getByTestId(DATA_TEST_ID.SettingsCard__AvatarImage);
  }
  public grabbableInCard(cardIndex: number): Locator {
    return this.getByTestId(DATA_TEST_ID.SettingsCard__DragHandle).nth(cardIndex);
  }

  // Action buttons in cards
  public get editCardButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.SettingsCard__EditAction).last();
  }
  public get deleteCardButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.SettingsCard__DeleteAction).last();
  }
  public get editIconButton(): Locator {
    return this.getByLabel("edit").locator("svg");
  }
  public get deleteIconButton(): Locator {
    return this.getByLabel("delete").locator("svg");
  }

  // Common form elements
  public get closeButton(): Locator {
    return this.getByLabel("Close", { exact: true }).first();
  }
  public get formElement(): Locator {
    return this.locator("form");
  }

  // Text elements
  public textByName(text: string, exact = false): Locator {
    return this.getByText(text, { exact });
  }

  // URL input (different from general textbox)
  public get urlTextbox(): Locator {
    return this.getByLabel("URL", { exact: true });
  }

  // Account and Language settings
  public get accountText(): Locator {
    return this.getByText(/Account|アカウント/);
  }
  public get currentLanguageText(): Locator {
    return this.getByText(/Auto|自動|English|日本語/);
  }
  public get languageOptionJapanese(): Locator {
    return this.getByTitle("日本語").last();
  }
  public get languageOptionEnglish(): Locator {
    return this.getByTitle("English").last();
  }
  public languageOptionByTitle(title: string): Locator {
    return this.getByTitle(title).last();
  }
  public get formSaveButton(): Locator {
    return this.locator("form").getByRole("button").nth(1);
  }
  public get japaneseFirstText(): Locator {
    return this.getByText("日本語").first();
  }
  public get englishFirstText(): Locator {
    return this.getByText("English").first();
  }

  // Account management
  public get accountNameInput(): Locator {
    return this.getByLabel(/Account Name|アカウント名/);
  }
  public get yourEmailInput(): Locator {
    return this.getByLabel(/Your Email|メールアドレス/);
  }
  public get accountNameInputExact(): Locator {
    return this.getByLabel("Account Name");
  }
  public get yourEmailInputExact(): Locator {
    return this.getByLabel("Your Email");
  }
  public get formSubmitButton(): Locator {
    return this.locator("form").getByRole("button").first();
  }
  public get headerElement(): Locator {
    return this.locator("header");
  }

  public get labelledTileDiv(): Locator {
    return this.locator("div")
      .filter({ hasText: /^Labelled$/ })
      .nth(4);
  }

  public get arcGisTerrainDiv(): Locator {
    return this.locator("div")
      .filter({ hasText: /^ArcGIS Terrain$/ })
      .nth(4);
  }
}

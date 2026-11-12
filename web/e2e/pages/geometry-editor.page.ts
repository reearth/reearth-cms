// e2e/pages/geometry-editor.page.ts
import type { Locator } from "@reearth-cms/e2e/fixtures/test";
import { DATA_TEST_ID } from "@reearth-cms/test/data";

import { BasePage } from "./base.page";

/** The unified Geometry field: its preview in the item form and its full-screen editor. */
export class GeometryEditorPage extends BasePage {
  // Field preview in the item form
  get addGeometryButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.GeometryFieldPreview__AddButton);
  }
  get editGeometryButton(): Locator {
    return this.getByTestId(DATA_TEST_ID.GeometryFieldPreview__EditButton);
  }

  // Editor modal
  get editor(): Locator {
    return this.getByTestId(DATA_TEST_ID.GeometryEditor__Root);
  }
  get pointTool(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__ToolPoint);
  }
  get map(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__Map);
  }
  get applyButton(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__ApplyButton);
  }
  get cancelButton(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__CancelButton);
  }
  /** The side pane holding the GeoJSON and Coordinates panels; collapsed for a valid value. */
  get sidePanelToggle(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__SidePanelToggle);
  }
  get geoJsonPanelToggle(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__GeoJsonToggle);
  }
  /** One row per geometry the editor holds; rows appear once typed GeoJSON is accepted. */
  get shapeRows(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__ShapeRow);
  }
  /** The Monaco editor inside the GeoJSON panel. */
  get monacoEditor(): Locator {
    return this.editor.getByTestId(DATA_TEST_ID.GeometryEditor__GeoJsonEditor);
  }
  /** Monaco's rendered text inside the GeoJSON panel. */
  get geoJsonText(): Locator {
    return this.monacoEditor.locator(".view-lines");
  }

  async drawPointAtMapCenter(): Promise<void> {
    await this.pointTool.click();
    await this.map.click();
  }

  async openGeoJsonPanel(): Promise<void> {
    await this.expand(this.sidePanelToggle);
    await this.expand(this.geoJsonPanelToggle);
    await this.geoJsonText.waitFor({ state: "visible" });
  }

  /** Both toggles flip, so click only when collapsed. */
  private async expand(toggle: Locator): Promise<void> {
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  }

  /**
   * Replaces the panel's text with complete GeoJSON, inserted in one go. Typing it key by key
   * lets Monaco auto-close brackets, wrap the selection and accept suggestions, which mangle it.
   */
  async pasteGeoJson(text: string): Promise<void> {
    await this.openGeoJsonPanel();
    await this.geoJsonText.click();
    // Keys pressed before Monaco has focus are lost.
    await this.monacoEditor.locator(".monaco-editor.focused").waitFor({ state: "visible" });
    await this.clearGeoJson();
    await this.page.keyboard.insertText(text);
  }

  /**
   * Empties a one-line value (a new item's "[]" or "") with Monaco's "Delete All Left", run
   * from the command palette: Cmd+A doesn't reach Monaco in Playwright's bundled Chromium on
   * macOS, and the palette has no plain "Select All". F1 opens the palette prefilled with ">"
   * (command mode), so the fill must keep it.
   */
  private async clearGeoJson(): Promise<void> {
    await this.keypress("F1");
    const palette = this.monacoEditor.locator(".quick-input-widget input");
    await palette.waitFor({ state: "visible" });
    await palette.fill(">Delete All Left");
    await this.keypress("Enter");
    await palette.waitFor({ state: "hidden" });
  }

  async apply(): Promise<void> {
    await this.applyButton.click();
    await this.editor.waitFor({ state: "hidden" });
  }

  /** Closes an editor that holds no changes, so no discard prompt appears. */
  async close(): Promise<void> {
    await this.cancelButton.click();
    await this.editor.waitFor({ state: "hidden" });
  }
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { TerrainInput, TileInput } from "@reearth-cms/components/molecules/Workspace/types";

import FormModal, { TerrainTypeFormat, TileTypeFormat } from "./FormModal";

describe("FormModal", () => {
  const user = userEvent.setup();

  const open = true;
  const onClose = () => {};
  const tiles: TileInput[] = [];
  const terrains: TerrainInput[] = [];
  const setSettings = () => {};

  test("Tile options are displayed successfully", async () => {
    render(
      <FormModal
        isTile={true}
        onClose={onClose}
        open={open}
        setSettings={setSettings}
        terrains={terrains}
        tiles={tiles}
      />,
    );

    await user.click(screen.getByLabelText("Tiles type"));
    Object.values(TileTypeFormat).forEach(value => {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    });
  });

  test("Name, URL, and Image URL values are displayed successfully when tile type is URL", async () => {
    const name = "testName";
    const url = "testURL";
    const image = "testImage";

    render(
      <FormModal
        index={0}
        isTile={true}
        onClose={onClose}
        open={open}
        setSettings={setSettings}
        terrains={terrains}
        tiles={[
          {
            tile: {
              id: "",
              props: {
                image,
                name,
                url,
              },
              type: "URL",
            },
          },
        ]}
      />,
    );

    await expect.poll(() => screen.getByDisplayValue(name)).toBeVisible();
    expect(screen.getByDisplayValue(url)).toBeVisible();
    expect(screen.getByDisplayValue(image)).toBeVisible();
  });

  test("Terrain options are displayed successfully", async () => {
    render(
      <FormModal
        isTile={false}
        onClose={onClose}
        open={open}
        setSettings={setSettings}
        terrains={terrains}
        tiles={tiles}
      />,
    );

    await user.click(screen.getByLabelText("Terrain type"));
    Object.values(TerrainTypeFormat).forEach(value => {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    });
  });

  test("Name, Cesium Ion asset ID, Cesium Ion access token, URL, and Image URL values are displayed successfully when terrain type is Cesium Ion", async () => {
    const name = "testName";
    const url = "testURL";
    const image = "testImage";
    const cesiumIonAssetId = "testCesiumIonAssetId";
    const cesiumIonAccessToken = "testCesiumIonAccessToken";

    render(
      <FormModal
        index={0}
        isTile={false}
        onClose={onClose}
        open={open}
        setSettings={setSettings}
        terrains={[
          {
            terrain: {
              id: "",
              props: {
                cesiumIonAccessToken,
                cesiumIonAssetId,
                image,
                name,
                url,
              },
              type: "CESIUM_ION",
            },
          },
        ]}
        tiles={tiles}
      />,
    );

    await expect.poll(() => screen.getByDisplayValue(name)).toBeVisible();
    expect(screen.getByDisplayValue(url)).toBeVisible();
    expect(screen.getByDisplayValue(image)).toBeVisible();
    expect(screen.getByDisplayValue(cesiumIonAssetId)).toBeVisible();
    expect(screen.getByDisplayValue(cesiumIonAccessToken)).toBeVisible();
  });
});

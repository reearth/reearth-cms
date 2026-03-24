import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import { TileInput, TerrainInput } from "@reearth-cms/components/molecules/Workspace/types";

import FormModal, { TileTypeFormat, TerrainTypeFormat } from "./FormModal";

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
        open={open}
        onClose={onClose}
        tiles={tiles}
        terrains={terrains}
        setSettings={setSettings}
        isTile={true}
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
        open={open}
        onClose={onClose}
        tiles={[
          {
            tile: {
              id: "",
              type: "URL",
              props: {
                name,
                url,
                image,
              },
            },
          },
        ]}
        terrains={terrains}
        setSettings={setSettings}
        isTile={true}
        index={0}
      />,
    );

    await expect.poll(() => screen.getByDisplayValue(name)).toBeVisible();
    expect(screen.getByDisplayValue(url)).toBeVisible();
    expect(screen.getByDisplayValue(image)).toBeVisible();
  });

  test("Terrain options are displayed successfully", async () => {
    render(
      <FormModal
        open={open}
        onClose={onClose}
        tiles={tiles}
        terrains={terrains}
        setSettings={setSettings}
        isTile={false}
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
        open={open}
        onClose={onClose}
        tiles={tiles}
        terrains={[
          {
            terrain: {
              id: "",
              type: "CESIUM_ION",
              props: {
                name,
                url,
                image,
                cesiumIonAssetId,
                cesiumIonAccessToken,
              },
            },
          },
        ]}
        setSettings={setSettings}
        isTile={false}
        index={0}
      />,
    );

    await expect.poll(() => screen.getByDisplayValue(name)).toBeVisible();
    expect(screen.getByDisplayValue(url)).toBeVisible();
    expect(screen.getByDisplayValue(image)).toBeVisible();
    expect(screen.getByDisplayValue(cesiumIonAssetId)).toBeVisible();
    expect(screen.getByDisplayValue(cesiumIonAccessToken)).toBeVisible();
  });
});

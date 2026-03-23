import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import Settings from ".";

const noopAsync = async () => {};

const emptySettings: WorkspaceSettings = {
  tiles: { resources: [] },
  terrains: { resources: [], enabled: false },
};

const settingsWithTiles: WorkspaceSettings = {
  tiles: {
    resources: [
      {
        id: "tile-1",
        type: "DEFAULT",
        props: { name: "Default Tile", url: "https://example.com/tile1", image: "" },
      },
      {
        id: "tile-2",
        type: "OPEN_STREET_MAP",
        props: { name: "OpenStreetMap", url: "https://example.com/tile2", image: "" },
      },
    ],
  },
  terrains: { resources: [], enabled: false },
};

const settingsWithTerrainEnabled: WorkspaceSettings = {
  tiles: {
    resources: [
      {
        id: "tile-1",
        type: "DEFAULT",
        props: { name: "Default Tile", url: "https://example.com/tile1", image: "" },
      },
    ],
  },
  terrains: {
    resources: [
      {
        id: "terrain-1",
        type: "CESIUM_WORLD_TERRAIN",
        props: {
          name: "Cesium World Terrain",
          url: "https://example.com/terrain",
          image: "",
          cesiumIonAssetId: "1",
          cesiumIonAccessToken: "token",
        },
      },
    ],
    enabled: true,
  },
};

describe("[Visual] Settings", () => {
  test("loading state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Settings
            loading={true}
            workspaceSettings={emptySettings}
            hasUpdateRight={true}
            updateLoading={false}
            onWorkspaceSettingsUpdate={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("empty settings", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Settings
            loading={false}
            workspaceSettings={emptySettings}
            hasUpdateRight={true}
            updateLoading={false}
            onWorkspaceSettingsUpdate={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("with tile resources", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Settings
            loading={false}
            workspaceSettings={settingsWithTiles}
            hasUpdateRight={true}
            updateLoading={false}
            onWorkspaceSettingsUpdate={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("terrain enabled with resources", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <Settings
            loading={false}
            workspaceSettings={settingsWithTerrainEnabled}
            hasUpdateRight={true}
            updateLoading={false}
            onWorkspaceSettingsUpdate={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});

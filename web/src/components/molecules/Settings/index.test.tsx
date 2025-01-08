import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import Settings from ".";

describe("Settings", () => {
  const user = userEvent.setup();

  const workspaceSettings = {
    tiles: {
      resources: [],
    },
    terrains: {
      enabled: true,
      resources: [],
    },
  };
  const hasUpdateRight = true;
  const loading = false;
  const onWorkspaceSettingsUpdate = () => {
    return Promise.resolve();
  };

  test("Cards displays successfully", async () => {
    render(
      <Settings
        workspaceSettings={{
          tiles: {
            resources: [
              {
                id: "",
                type: "DEFAULT",
                props: {
                  image: "",
                  name: "",
                  url: "",
                },
              },
            ],
          },
          terrains: {
            resources: [
              {
                id: "",
                type: "CESIUM_WORLD_TERRAIN",
                props: {
                  url: "",
                  name: "",
                  image: "",
                  cesiumIonAccessToken: "",
                  cesiumIonAssetId: "",
                },
              },
            ],
            enabled: true,
          },
        }}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={onWorkspaceSettingsUpdate}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(screen.getByText("DEFAULT")).toBeVisible();
    expect(screen.getByText("CESIUM_WORLD_TERRAIN")).toBeVisible();
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole("switch"));
    expect(screen.queryByText("CESIUM_WORLD_TERRAIN")).not.toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  test("Loading on button displays successfully", () => {
    render(
      <Settings
        workspaceSettings={workspaceSettings}
        hasUpdateRight={hasUpdateRight}
        loading={true}
        onWorkspaceSettingsUpdate={onWorkspaceSettingsUpdate}
      />,
    );

    expect(screen.getByLabelText("loading")).toBeVisible();
  });

  test("Action is correctly disabled based on user right", () => {
    render(
      <Settings
        workspaceSettings={workspaceSettings}
        hasUpdateRight={false}
        loading={loading}
        onWorkspaceSettingsUpdate={onWorkspaceSettingsUpdate}
      />,
    );

    expect(screen.getByRole("switch")).toBeDisabled();
    screen.getAllByRole("button").map(button => {
      expect(button).toBeDisabled();
    });
  });
});

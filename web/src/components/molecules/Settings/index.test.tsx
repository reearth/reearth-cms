import { render, screen, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

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

  test("Cards are displayed successfully", async () => {
    render(
      <Settings
        workspaceSettings={{
          tiles: {
            resources: [
              {
                id: "",
                type: "DEFAULT",
                props: {
                  name: "",
                  url: "",
                  image: "",
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
                  name: "",
                  url: "",
                  image: "",
                  cesiumIonAssetId: "",
                  cesiumIonAccessToken: "",
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

  test("Loading on button are displayed successfully", () => {
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

  test("Adding a new tile successfully", async () => {
    const updateMock = vi.fn();

    render(
      <Settings
        workspaceSettings={workspaceSettings}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={updateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();
    expect(screen.queryByText("DEFAULT")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "plus Add new Tiles option" }));
    await expect.poll(() => screen.getByText("New Tiles")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText("DEFAULT")).toBeVisible();

    await user.click(saveButton);
    expect(updateMock).toHaveBeenCalled();
  });

  test("Adding a new terrain successfully", async () => {
    const updateMock = vi.fn();

    render(
      <Settings
        workspaceSettings={workspaceSettings}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={updateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();
    expect(screen.queryByText("CESIUM_WORLD_TERRAIN")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "plus Add new Terrain option" }));
    await expect.poll(() => screen.getByText("New Terrain")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText("CESIUM_WORLD_TERRAIN")).toBeVisible();

    await user.click(saveButton);
    expect(updateMock).toHaveBeenCalled();
  });

  test("Updating a tile successfully", async () => {
    const updateMock = vi.fn();

    const { container } = render(
      <Settings
        workspaceSettings={{
          tiles: {
            resources: [
              {
                id: "",
                type: "DEFAULT",
                props: {
                  name: "",
                  url: "",
                  image: "",
                },
              },
            ],
          },
          terrains: {
            resources: [],
            enabled: true,
          },
        }}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={updateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText("DEFAULT")).toBeVisible();
    expect(screen.queryByText("LABELLED")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("edit"));
    await expect.poll(() => screen.getByText("Update Tiles")).toBeVisible();

    await user.click(screen.getByLabelText("Tiles type"));
    await user.click(screen.getByText("Labelled"));
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText("DEFAULT")).not.toBeVisible();
    expect(getByText(container, "LABELLED")).toBeVisible();

    await user.click(saveButton);
    expect(updateMock).toHaveBeenCalled();
  });

  test("Updating a terrain successfully", async () => {
    const updateMock = vi.fn();

    const { container } = render(
      <Settings
        workspaceSettings={{
          tiles: {
            resources: [],
          },
          terrains: {
            resources: [
              {
                id: "",
                type: "CESIUM_WORLD_TERRAIN",
                props: {
                  name: "",
                  url: "",
                  image: "",
                  cesiumIonAssetId: "",
                  cesiumIonAccessToken: "",
                },
              },
            ],
            enabled: true,
          },
        }}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={updateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText("CESIUM_WORLD_TERRAIN")).toBeVisible();
    expect(screen.queryByText("ARC_GIS_TERRAIN")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("edit"));
    await expect.poll(() => screen.getByText("Update Terrain")).toBeVisible();

    await user.click(screen.getByLabelText("Terrain type"));
    await user.click(screen.getByText("ArcGIS Terrain"));
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText("CESIUM_WORLD_TERRAIN")).not.toBeVisible();
    expect(getByText(container, "ARC_GIS_TERRAIN")).toBeVisible();

    await user.click(saveButton);
    expect(updateMock).toHaveBeenCalled();
  });

  test("Deleting a tile successfully", async () => {
    const updateMock = vi.fn();

    render(
      <Settings
        workspaceSettings={{
          tiles: {
            resources: [
              {
                id: "",
                type: "DEFAULT",
                props: {
                  name: "",
                  url: "",
                  image: "",
                },
              },
            ],
          },
          terrains: {
            resources: [],
            enabled: true,
          },
        }}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={updateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText("DEFAULT")).toBeVisible();

    await user.click(screen.getByLabelText("delete"));
    expect(screen.queryByText("DEFAULT")).not.toBeInTheDocument();

    await user.click(saveButton);
    expect(updateMock).toHaveBeenCalled();
  });

  test("Deleting a terrain successfully", async () => {
    const updateMock = vi.fn();

    render(
      <Settings
        workspaceSettings={{
          tiles: {
            resources: [],
          },
          terrains: {
            resources: [
              {
                id: "",
                type: "CESIUM_WORLD_TERRAIN",
                props: {
                  name: "",
                  url: "",
                  image: "",
                  cesiumIonAssetId: "",
                  cesiumIonAccessToken: "",
                },
              },
            ],
            enabled: true,
          },
        }}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onWorkspaceSettingsUpdate={updateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(saveButton).toBeDisabled();
    expect(screen.getByText("CESIUM_WORLD_TERRAIN")).toBeVisible();

    await user.click(screen.getByLabelText("delete"));
    expect(screen.queryByText("CESIUM_WORLD_TERRAIN")).not.toBeInTheDocument();

    await user.click(saveButton);
    expect(updateMock).toHaveBeenCalled();
  });
});

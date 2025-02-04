import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";

import IntegrationTable from ".";

describe("IntegrationTable", () => {
  const user = userEvent.setup();

  const workspaceIntegrations: WorkspaceIntegration[] = [];
  const onSearchTerm = () => {};
  const onIntegrationSettingsModalOpen = () => {};
  const onIntegrationConnectModalOpen = () => {};
  const deleteLoading = false;
  const onIntegrationRemove = () => {
    return Promise.resolve();
  };
  const page = 1;
  const pageSize = 10;
  const onTableChange = () => {};
  const loading = false;
  const onReload = () => {};
  const hasConnectRight = true;
  const hasUpdateRight = true;
  const hasDeleteRight = true;

  test("Table options works successfully", async () => {
    const reloadMock = vi.fn();

    render(
      <IntegrationTable
        workspaceIntegrations={workspaceIntegrations}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={reloadMock}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    const reloadIcon = screen.getByLabelText("reload");
    const heightIcon = screen.getByLabelText("column-height");
    const settingIcon = screen.getByLabelText("setting");
    const fullscreenIcon = screen.getByLabelText("fullscreen");

    await user.click(reloadIcon);
    expect(reloadMock).toHaveBeenCalled();
    expect(heightIcon).toBeVisible();
    expect(settingIcon).toBeVisible();
    expect(fullscreenIcon).toBeVisible();
  });

  test("Document link is displayed on placeholder successfully", () => {
    render(
      <IntegrationTable
        workspaceIntegrations={workspaceIntegrations}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    expect(screen.getByRole("link")).toBeVisible();
  });

  test("Connecting buttons works successfully", async () => {
    const connectModalOpenMock = vi.fn();

    render(
      <IntegrationTable
        workspaceIntegrations={workspaceIntegrations}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={connectModalOpenMock}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    const connectButtons = screen.getAllByRole("button", { name: "api Connect Integration" });
    for (const button of connectButtons) {
      await user.click(button);
    }
    expect(connectModalOpenMock).toBeCalledTimes(2);
  });

  test("Searching works successfully", async () => {
    const searchMock = vi.fn();

    render(
      <IntegrationTable
        workspaceIntegrations={workspaceIntegrations}
        onSearchTerm={searchMock}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    const search = screen.getByPlaceholderText("input search text");
    const searchButton = screen.getByRole("button", { name: "search" });
    await user.click(search);
    await user.keyboard("[Enter]");
    await user.click(searchButton);
    expect(searchMock).toBeCalledTimes(2);
  });

  test("Data is displayed successfully", async () => {
    render(
      <IntegrationTable
        workspaceIntegrations={[
          {
            name: "name",
            createdBy: { id: "", name: "creatorName", email: "" },
            role: "READER",
          },
        ]}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    expect(screen.getByText("name")).toBeVisible();
    expect(screen.getByText("READER")).toBeVisible();
    expect(screen.getByText("creatorName")).toBeVisible();
  });
});

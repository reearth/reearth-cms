import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";

import IntegrationTable from ".";

describe("Integration table", () => {
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
  const hasConnectRight = true;
  const hasUpdateRight = true;
  const hasDeleteRight = true;

  const name = "name";
  const creatorName = "creatorName";
  const role = "READER";
  const integration: WorkspaceIntegration = {
    createdBy: { email: "", id: "", name: creatorName },
    id: "id",
    name,
    role,
  };

  test("Page number and number of items per page are displayed successfully", async () => {
    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={[integration]}
      />,
    );

    expect(screen.getByTitle(page)).toBeVisible();
    expect(screen.getByText(`${pageSize} / page`)).toBeVisible();
  });

  test("Document link is displayed on placeholder successfully", () => {
    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={workspaceIntegrations}
      />,
    );

    expect(screen.getByPlaceholderText("input search text")).toBeVisible();
  });

  test("Connecting buttons works successfully", async () => {
    const connectModalOpenMock = vi.fn();

    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={connectModalOpenMock}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={workspaceIntegrations}
      />,
    );

    const connectButton = screen.getByRole("button", { name: "apiConnect Integration" });
    await user.click(connectButton);
    expect(connectModalOpenMock).toBeCalledTimes(1);
  });

  test("Searching works successfully", async () => {
    const searchMock = vi.fn();

    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={searchMock}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={workspaceIntegrations}
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
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={[integration]}
      />,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Creator")).toBeInTheDocument();
    expect(screen.getByText(name)).toBeVisible();
    expect(screen.getByText(role)).toBeVisible();
    expect(screen.getByText(creatorName)).toBeVisible();
  });

  test("Removing an integration is fired successfully", async () => {
    const onIntegrationRemoveMock = vi.fn();

    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemoveMock}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={[integration]}
      />,
    );

    await user.click(screen.getByLabelText("Select all"));
    await user.click(screen.getByRole("button", { name: "deleteRemove" }));
    expect(onIntegrationRemoveMock).toHaveBeenCalled();
  });

  test("Delete loading is displayed successfully", async () => {
    render(
      <IntegrationTable
        deleteLoading={true}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={[integration]}
      />,
    );

    await user.click(screen.getByLabelText("Select all"));
    expect(screen.getByLabelText("loading")).toBeVisible();
  });

  test("Connecting buttons are disabled according to user right successfully", async () => {
    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={false}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={workspaceIntegrations}
      />,
    );

    for (const button of screen.getAllByRole("button", { name: "apiConnect Integration" })) {
      expect(button).toBeDisabled();
    }
  });

  test("Update and remove buttons are disabled according to user right successfully", async () => {
    render(
      <IntegrationTable
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={false}
        hasUpdateRight={false}
        loading={loading}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        onIntegrationRemove={onIntegrationRemove}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        workspaceIntegrations={[integration]}
      />,
    );

    expect(screen.getByRole("button", { name: "setting" })).toBeDisabled();

    await user.click(screen.getByLabelText("Select all"));
    expect(screen.getByRole("button", { name: "deleteRemove" })).toBeDisabled();
  });
});

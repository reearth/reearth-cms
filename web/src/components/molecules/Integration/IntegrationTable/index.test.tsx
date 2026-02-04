import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

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
    id: "id",
    name,
    createdBy: { id: "", name: creatorName, email: "" },
    role,
  };

  test("Page number and number of items per page are displayed successfully", async () => {
    render(
      <IntegrationTable
        workspaceIntegrations={[integration]}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    expect(screen.getByTitle(page)).toBeVisible();
    expect(screen.getByText(`${pageSize} / page`)).toBeVisible();
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
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    expect(screen.getByPlaceholderText("input search text")).toBeVisible();
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
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    const connectButton = screen.getByTestId(
      DATA_TEST_ID.IntegrationTable__ConnectIntegrationButton,
    );
    await user.click(connectButton);

    expect(connectModalOpenMock).toBeCalledTimes(1);
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
        workspaceIntegrations={[integration]}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    expect(screen.getByText("Name", { selector: ".ant-table-cell" })).toBeVisible();
    expect(screen.getByText("Role", { selector: ".ant-table-cell" })).toBeVisible();
    expect(screen.getByText("Creator", { selector: ".ant-table-cell" })).toBeVisible();
    expect(screen.getByText(name)).toBeVisible();
    expect(screen.getByText(role)).toBeVisible();
    expect(screen.getByText(creatorName)).toBeVisible();
  });

  test("Removing an integration is fired successfully", async () => {
    const onIntegrationRemoveMock = vi.fn();

    render(
      <IntegrationTable
        workspaceIntegrations={[integration]}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemoveMock}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    const selectAllEl = screen.getAllByLabelText("Select all")[0];
    expect(selectAllEl).toBeInTheDocument();
    await user.click(selectAllEl);
    await user.click(screen.getByTestId(DATA_TEST_ID.IntegrationTable__RemoveButton));
    expect(onIntegrationRemoveMock).toHaveBeenCalled();
  });

  test("Delete loading is displayed successfully", async () => {
    render(
      <IntegrationTable
        workspaceIntegrations={[integration]}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={true}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    const selectAllEl = screen.getAllByLabelText("Select all")[0];
    expect(selectAllEl).toBeInTheDocument();
    await user.click(selectAllEl);
    expect(screen.getByLabelText("loading")).toBeVisible();
  });

  test("Connecting buttons are disabled according to user right successfully", async () => {
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
        hasConnectRight={false}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />,
    );

    for (const button of screen.getAllByTestId(
      DATA_TEST_ID.IntegrationTable__ConnectIntegrationButton,
    )) {
      expect(button).toBeDisabled();
    }
  });

  test("Update and remove buttons are disabled according to user right successfully", async () => {
    render(
      <IntegrationTable
        workspaceIntegrations={[integration]}
        onSearchTerm={onSearchTerm}
        onIntegrationSettingsModalOpen={onIntegrationSettingsModalOpen}
        onIntegrationConnectModalOpen={onIntegrationConnectModalOpen}
        deleteLoading={deleteLoading}
        onIntegrationRemove={onIntegrationRemove}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={false}
        hasDeleteRight={false}
      />,
    );

    expect(screen.getByRole("button", { name: "setting" })).toBeDisabled();

    const selectAllEl = screen.getAllByLabelText("Select all")[0];
    expect(selectAllEl).toBeInTheDocument();
    await user.click(selectAllEl);
    expect(screen.getByTestId(DATA_TEST_ID.IntegrationTable__RemoveButton)).toBeDisabled();
  });
});

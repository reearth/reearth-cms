import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import IntegrationWrapper from ".";

describe("Integration wrapper", () => {
  const user = userEvent.setup();

  const workspaceIntegrations = [
    {
      name: "name",
      createdBy: { id: "", name: "creatorName", email: "" },
      role: "READER" as const,
    },
  ];
  const onSearchTerm = () => {};
  const setSelectedIntegration = () => {};
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

  const myIntegrations = undefined;
  const addLoading = false;
  const onIntegrationConnect = () => {
    return Promise.resolve();
  };

  const selectedIntegration = {
    id: "id",
    name: "name",
    role: "READER" as const,
  };
  const updateLoading = false;
  const onUpdateIntegration = () => {
    return Promise.resolve();
  };

  test("Connect modal works successfully", async () => {
    render(
      <IntegrationWrapper
        loading={loading}
        workspaceIntegrations={workspaceIntegrations}
        onSearchTerm={onSearchTerm}
        onReload={onReload}
        setSelectedIntegration={setSelectedIntegration}
        onIntegrationRemove={onIntegrationRemove}
        deleteLoading={deleteLoading}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        myIntegrations={myIntegrations}
        addLoading={addLoading}
        onIntegrationConnect={onIntegrationConnect}
        selectedIntegration={selectedIntegration}
        updateLoading={updateLoading}
        onUpdateIntegration={onUpdateIntegration}
      />,
    );

    await user.click(screen.getByRole("button", { name: "api Connect Integration" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Setting modal works successfully", async () => {
    render(
      <IntegrationWrapper
        loading={loading}
        workspaceIntegrations={workspaceIntegrations}
        onSearchTerm={onSearchTerm}
        onReload={onReload}
        setSelectedIntegration={setSelectedIntegration}
        onIntegrationRemove={onIntegrationRemove}
        deleteLoading={deleteLoading}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        hasConnectRight={hasConnectRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        myIntegrations={myIntegrations}
        addLoading={addLoading}
        onIntegrationConnect={onIntegrationConnect}
        selectedIntegration={selectedIntegration}
        updateLoading={updateLoading}
        onUpdateIntegration={onUpdateIntegration}
      />,
    );

    await user.click(screen.getByRole("button", { name: "setting" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

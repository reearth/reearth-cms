import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import IntegrationWrapper from ".";

describe("Integration wrapper", () => {
  const user = userEvent.setup();

  const workspaceIntegrations = [
    {
      createdBy: { email: "", id: "", name: "creatorName" },
      name: "name",
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
        addLoading={addLoading}
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        myIntegrations={myIntegrations}
        onIntegrationConnect={onIntegrationConnect}
        onIntegrationRemove={onIntegrationRemove}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        onUpdateIntegration={onUpdateIntegration}
        page={page}
        pageSize={pageSize}
        selectedIntegration={selectedIntegration}
        setSelectedIntegration={setSelectedIntegration}
        updateLoading={updateLoading}
        workspaceIntegrations={workspaceIntegrations}
      />,
    );

    await user.click(screen.getByRole("button", { name: "apiConnect Integration" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Setting modal works successfully", async () => {
    render(
      <IntegrationWrapper
        addLoading={addLoading}
        deleteLoading={deleteLoading}
        hasConnectRight={hasConnectRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        loading={loading}
        myIntegrations={myIntegrations}
        onIntegrationConnect={onIntegrationConnect}
        onIntegrationRemove={onIntegrationRemove}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        onUpdateIntegration={onUpdateIntegration}
        page={page}
        pageSize={pageSize}
        selectedIntegration={selectedIntegration}
        setSelectedIntegration={setSelectedIntegration}
        updateLoading={updateLoading}
        workspaceIntegrations={workspaceIntegrations}
      />,
    );

    await user.click(screen.getByRole("button", { name: "setting" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

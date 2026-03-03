import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import WorkspaceSettingsWrapper from ".";

const workspaceName = "workspaceName";
const updateWorkspaceLoading = false;
const hasUpdateRight = true;
const hasDeleteRight = true;
const onWorkspaceUpdate = () => {
  return Promise.resolve();
};
const onWorkspaceDelete = () => {
  return Promise.resolve();
};

test("Workspace settings wrapper works successfully", async () => {
  render(
    <WorkspaceSettingsWrapper
      hasDeleteRight={hasDeleteRight}
      hasUpdateRight={hasUpdateRight}
      onWorkspaceDelete={onWorkspaceDelete}
      onWorkspaceUpdate={onWorkspaceUpdate}
      updateWorkspaceLoading={updateWorkspaceLoading}
      workspaceName={workspaceName}
    />,
  );

  expect(screen.getByRole("heading", { name: "Workspace Settings" })).toBeVisible();
  expect(screen.getByText("General")).toBeVisible();
  expect(screen.getByText("Danger Zone")).toBeVisible();
});

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
      workspaceName={workspaceName}
      updateWorkspaceLoading={updateWorkspaceLoading}
      hasUpdateRight={hasUpdateRight}
      hasDeleteRight={hasDeleteRight}
      onWorkspaceUpdate={onWorkspaceUpdate}
      onWorkspaceDelete={onWorkspaceDelete}
    />,
  );

  expect(screen.getByRole("heading", { name: "Workspace Settings" })).toBeVisible();
  expect(screen.getByText("General")).toBeVisible();
  expect(screen.getByText("Danger Zone")).toBeVisible();
});

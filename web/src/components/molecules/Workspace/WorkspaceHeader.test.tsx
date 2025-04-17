import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import WorkspaceHeader from "./WorkspaceHeader";

const hasCreateRight = true;
const onProjectSearch = () => {};
const onProjectCreate = () => {
  return Promise.resolve();
};
const onWorkspaceCreate = () => {
  return Promise.resolve();
};
const onProjectAliasCheck = () => {
  return Promise.resolve(true);
};

test("Workspace header works successfully", () => {
  render(
    <WorkspaceHeader
      hasCreateRight={hasCreateRight}
      onWorkspaceCreate={onWorkspaceCreate}
      onProjectSearch={onProjectSearch}
      onProjectCreate={onProjectCreate}
      onProjectAliasCheck={onProjectAliasCheck}
    />,
  );

  expect(screen.getByRole("searchbox")).toBeVisible();
  expect(screen.getByRole("button", { name: "Create a Workspace" })).toBeVisible();
  expect(screen.getByRole("button", { name: "plus New Project" })).toBeVisible();
});

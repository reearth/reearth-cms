import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Project } from "@reearth-cms/components/molecules/Workspace/types";

import WorkspaceWrapper from ".";

const coverImageUrl = undefined;
const projects: Project[] = [];
const loading = false;
const hasCreateRight = true;
const onProjectSearch = () => {};
const onProjectNavigation = () => {};
const onProjectCreate = () => {
  return Promise.resolve();
};
const onWorkspaceCreate = () => {
  return Promise.resolve();
};
const onProjectAliasCheck = () => {
  return Promise.resolve(true);
};

test("Workspace wrapper works successfully", () => {
  render(
    <WorkspaceWrapper
      coverImageUrl={coverImageUrl}
      projects={projects}
      loading={loading}
      hasCreateRight={hasCreateRight}
      onProjectSearch={onProjectSearch}
      onProjectNavigation={onProjectNavigation}
      onProjectCreate={onProjectCreate}
      onWorkspaceCreate={onWorkspaceCreate}
      onProjectAliasCheck={onProjectAliasCheck}
    />,
  );
  expect(screen.getByText(/Welcome/)).toBeVisible();
  expect(screen.getByRole("searchbox")).toBeVisible();
  expect(screen.getByRole("link")).toBeVisible();
});

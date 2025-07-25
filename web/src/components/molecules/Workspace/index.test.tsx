import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { Project } from "@reearth-cms/components/molecules/Workspace/types";

import WorkspaceWrapper from ".";

const coverImageUrl = undefined;
const projects: Project[] = [];
const loading = false;
const hasCreateRight = true;

test("Workspace wrapper works successfully", () => {
  render(
    <WorkspaceWrapper
      coverImageUrl={coverImageUrl}
      projects={projects}
      loading={loading}
      hasCreateRight={hasCreateRight}
      onProjectSearch={vi.fn()}
      onProjectSort={vi.fn()}
      onProjectNavigation={vi.fn()}
      onProjectCreate={vi.fn()}
      onWorkspaceCreate={vi.fn()}
      onProjectAliasCheck={vi.fn()}
    />,
  );
  expect(screen.getByText(/Welcome/)).toBeVisible();
  expect(screen.getByRole("searchbox")).toBeVisible();
  expect(screen.getByRole("link")).toBeVisible();
});

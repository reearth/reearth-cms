import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { Project, SortBy } from "@reearth-cms/components/molecules/Workspace/types";

import WorkspaceWrapper from ".";

const coverImageUrl = undefined;
const projects: Project[] = [];
const loading = false;
const hasCreateRight = true;
const page = 1;
const pageSize = 10;
const projectSort: SortBy = "updatedat";
const totalCount = 0;

test("Workspace wrapper works successfully", () => {
  render(
    <WorkspaceWrapper
      coverImageUrl={coverImageUrl}
      projects={projects}
      loading={loading}
      hasCreateRight={hasCreateRight}
      page={page}
      pageSize={pageSize}
      projectSort={projectSort}
      totalCount={totalCount}
      onProjectSearch={vi.fn()}
      onProjectSort={vi.fn()}
      onProjectNavigation={vi.fn()}
      onProjectCreate={vi.fn()}
      onWorkspaceCreate={vi.fn()}
      onProjectAliasCheck={vi.fn()}
      onPageChange={vi.fn()}
    />,
  );
  expect(screen.getByText(/Welcome/)).toBeVisible();
  expect(screen.getByRole("searchbox")).toBeVisible();
  expect(screen.getByRole("link")).toBeVisible();
});

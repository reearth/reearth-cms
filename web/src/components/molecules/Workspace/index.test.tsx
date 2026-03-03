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
      hasCreateRight={hasCreateRight}
      loading={loading}
      onPageChange={vi.fn()}
      onProjectAliasCheck={vi.fn()}
      onProjectCreate={vi.fn()}
      onProjectNavigation={vi.fn()}
      onProjectSearch={vi.fn()}
      onProjectSort={vi.fn()}
      onWorkspaceCreate={vi.fn()}
      page={page}
      pageSize={pageSize}
      projects={projects}
      projectSort={projectSort}
      totalCount={totalCount}
    />,
  );
  expect(screen.getByText(/Welcome/)).toBeVisible();
  expect(screen.getByRole("searchbox")).toBeVisible();
  expect(screen.getByRole("link")).toBeVisible();
});

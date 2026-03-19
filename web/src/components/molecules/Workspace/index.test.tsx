import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Project, SortBy } from "@reearth-cms/components/molecules/Workspace/types";

import WorkspaceWrapper from ".";

const defaultProps = {
  coverImageUrl: undefined as string | undefined,
  projects: [] as Project[],
  loading: false,
  hasCreateRight: true,
  page: 1,
  pageSize: 10,
  projectSort: "updatedat" as SortBy,
  totalCount: 0,
  onProjectSearch: vi.fn(),
  onProjectSort: vi.fn(),
  onProjectNavigation: vi.fn(),
  onProjectCreate: vi.fn(),
  onWorkspaceCreate: vi.fn(),
  onProjectAliasCheck: vi.fn(),
  onPageChange: vi.fn(),
};

describe("Workspace", () => {
  const savedConfig = window.REEARTH_CONFIG;

  beforeEach(() => {
    window.REEARTH_CONFIG = undefined;
  });

  afterEach(() => {
    window.REEARTH_CONFIG = savedConfig;
  });

  test("Workspace wrapper works successfully", () => {
    render(<WorkspaceWrapper {...defaultProps} />);
    expect(screen.getByText(/Welcome/)).toBeVisible();
    expect(screen.getByRole("searchbox")).toBeVisible();
    expect(screen.getByRole("link")).toBeVisible();
  });

  test("shows Create a Workspace button when disableWorkspaceUi is not set", () => {
    render(<WorkspaceWrapper {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Create a Workspace" })).toBeVisible();
  });

  test("hides Create a Workspace button when disableWorkspaceUi is true", () => {
    window.REEARTH_CONFIG = { api: "", editorUrl: "", disableWorkspaceUi: "true" };
    render(<WorkspaceWrapper {...defaultProps} />);
    expect(screen.queryByRole("button", { name: "Create a Workspace" })).not.toBeInTheDocument();
  });

  test("renders username in greeting", () => {
    render(<WorkspaceWrapper {...defaultProps} username="Bob" />);
    expect(screen.getByText(/Welcome to Re:Earth CMS, Bob!/)).toBeVisible();
  });
});

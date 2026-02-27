import { render, screen } from "@testing-library/react";
import { beforeAll, describe, test, expect, vi } from "vitest";

import type { Group } from "@reearth-cms/components/molecules/Schema/types";

import Groups from "./Groups";

vi.mock("react-drag-listview", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const makeGroup = (id: string, name: string, order = 0): Group => ({
  id,
  schemaId: `schema-${id}`,
  projectId: "project-1",
  name,
  description: "",
  key: name.toLowerCase(),
  schema: { id: `schema-${id}`, fields: [] },
  order,
});

const defaultProps = {
  title: "GROUPS",
  collapsed: false,
  groups: [makeGroup("g1", "Details"), makeGroup("g2", "Metadata")],
  open: false,
  hasCreateRight: true,
  hasUpdateRight: true,
  onModalOpen: vi.fn(),
  onGroupKeyCheck: vi.fn().mockResolvedValue(true),
  onClose: vi.fn(),
  onCreate: vi.fn(),
  onGroupSelect: vi.fn(),
  onUpdateGroupsOrder: vi.fn(),
};

describe("Groups", () => {
  test("renders GroupsList content with group names and header", () => {
    render(<Groups {...defaultProps} />);
    expect(screen.getByText("Details")).toBeVisible();
    expect(screen.getByText("Metadata")).toBeVisible();
    expect(screen.getByText("GROUPS")).toBeVisible();
  });

  test("renders FormModal with New Group title when open", () => {
    render(<Groups {...defaultProps} open />);
    expect(screen.getByText("New Group")).toBeInTheDocument();
  });
});

import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import APIKeyTable from "./APIKeyTable";

vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon, onClick }: { icon: string; onClick?: () => void }) => (
    <span data-testid={`icon-${icon}`} onClick={onClick} />
  ),
}));

vi.mock("./KeyCell", () => ({
  default: ({ apiKey }: { apiKey: string }) => (
    <span data-testid="mock-key-cell" data-api-key={apiKey} />
  ),
}));

const sampleKeys = [
  {
    id: "key-1",
    name: "Production Key",
    description: "",
    key: "sk-prod-abc",
    publication: { publicModels: [], publicAssets: false },
  },
  {
    id: "key-2",
    name: "Staging Key",
    description: "",
    key: "sk-staging-xyz",
    publication: { publicModels: [], publicAssets: false },
  },
];

describe("APIKeyTable", () => {
  const user = userEvent.setup();

  const defaultProps = {
    keys: sampleKeys,
    hasUpdateRight: true,
    hasDeleteRight: true,
    onAPIKeyDelete: vi.fn(() => Promise.resolve()),
    onAPIKeyEdit: vi.fn(),
  };

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  // Group 1 — Rendering

  test("renders table with Name and Key column headers", () => {
    render(<APIKeyTable {...defaultProps} />);

    expect(screen.getByText("Name")).toBeVisible();
    expect(screen.getByText("Key")).toBeVisible();
  });

  test("renders key names in rows", () => {
    render(<APIKeyTable {...defaultProps} />);

    expect(screen.getByText("Production Key")).toBeVisible();
    expect(screen.getByText("Staging Key")).toBeVisible();
  });

  test("passes apiKey to KeyCell", () => {
    render(<APIKeyTable {...defaultProps} />);

    const cells = screen.getAllByTestId("mock-key-cell");
    expect(cells[0]).toHaveAttribute("data-api-key", "sk-prod-abc");
    expect(cells[1]).toHaveAttribute("data-api-key", "sk-staging-xyz");
  });

  test("renders empty table when keys is undefined", () => {
    render(<APIKeyTable {...defaultProps} keys={undefined} />);

    expect(screen.queryAllByTestId("mock-key-cell")).toHaveLength(0);
  });

  // Group 2 — Dropdown actions

  test("calls onAPIKeyEdit with correct id on Edit click", async () => {
    const onAPIKeyEdit = vi.fn();
    render(<APIKeyTable {...defaultProps} onAPIKeyEdit={onAPIKeyEdit} />);

    const ellipsisIcons = screen.getAllByTestId("icon-ellipsis");
    await user.click(ellipsisIcons[0]);

    const editItem = await screen.findByText("Edit");
    await user.click(editItem);

    expect(onAPIKeyEdit).toHaveBeenCalledWith("key-1");
  });

  test("Edit item disabled when hasUpdateRight=false", async () => {
    render(<APIKeyTable {...defaultProps} hasUpdateRight={false} />);

    const ellipsisIcons = screen.getAllByTestId("icon-ellipsis");
    await user.click(ellipsisIcons[0]);

    const editItem = await screen.findByText("Edit");
    expect(editItem.closest("li")).toHaveClass("ant-dropdown-menu-item-disabled");
  });

  test("Delete click opens confirm dialog, confirming calls onAPIKeyDelete", async () => {
    const onAPIKeyDelete = vi.fn(() => Promise.resolve());
    render(<APIKeyTable {...defaultProps} onAPIKeyDelete={onAPIKeyDelete} />);

    const ellipsisIcons = screen.getAllByTestId("icon-ellipsis");
    await user.click(ellipsisIcons[0]);

    const deleteItem = await screen.findByText("Delete");
    await user.click(deleteItem);

    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(onAPIKeyDelete).toHaveBeenCalledWith("key-1");
  });

  test("cancelling delete does not call onAPIKeyDelete", async () => {
    const onAPIKeyDelete = vi.fn(() => Promise.resolve());
    render(<APIKeyTable {...defaultProps} onAPIKeyDelete={onAPIKeyDelete} />);

    const ellipsisIcons = screen.getAllByTestId("icon-ellipsis");
    await user.click(ellipsisIcons[0]);

    const deleteItem = await screen.findByText("Delete");
    await user.click(deleteItem);

    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(onAPIKeyDelete).not.toHaveBeenCalled();
  });

  test("Delete item disabled when hasDeleteRight=false", async () => {
    render(<APIKeyTable {...defaultProps} hasDeleteRight={false} />);

    const ellipsisIcons = screen.getAllByTestId("icon-ellipsis");
    await user.click(ellipsisIcons[0]);

    const deleteItem = await screen.findByText("Delete");
    expect(deleteItem.closest("li")).toHaveClass("ant-dropdown-menu-item-disabled");
  });
});

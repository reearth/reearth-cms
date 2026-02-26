import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, test, expect, vi } from "vitest";

import type { Model } from "@reearth-cms/components/molecules/Model/types";

import ModelsList from "./ModelsList";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const makeModel = (id: string, name: string, order = 0): Model => ({
  id,
  name,
  description: "",
  key: name.toLowerCase(),
  schemaId: `schema-${id}`,
  schema: { id: `schema-${id}`, fields: [] },
  metadataSchema: {},
  order,
});

const defaultProps = {
  models: [makeModel("m1", "Blog"), makeModel("m2", "Product")],
  collapsed: false,
  hasCreateRight: true,
  hasUpdateRight: true,
  onModalOpen: vi.fn(),
  onModelSelect: vi.fn(),
  onUpdateModelsOrder: vi.fn(),
};

describe("ModelsList", () => {
  const user = userEvent.setup();

  test("renders model names", () => {
    render(<ModelsList {...defaultProps} />);
    expect(screen.getByText("Blog")).toBeVisible();
    expect(screen.getByText("Product")).toBeVisible();
  });

  test("renders MODELS header", () => {
    render(<ModelsList {...defaultProps} />);
    expect(screen.getByText("MODELS")).toBeVisible();
  });

  test("renders Add button", () => {
    render(<ModelsList {...defaultProps} />);
    expect(screen.getByText("Add")).toBeVisible();
  });

  test("disables Add button when hasCreateRight is false", () => {
    render(<ModelsList {...defaultProps} hasCreateRight={false} />);
    expect(screen.getByText("Add").closest("button")).toBeDisabled();
  });

  test("calls onModalOpen when Add button is clicked", async () => {
    const onModalOpen = vi.fn();
    render(<ModelsList {...defaultProps} onModalOpen={onModalOpen} />);
    await user.click(screen.getByText("Add"));
    expect(onModalOpen).toHaveBeenCalled();
  });

  test("calls onModelSelect when model item is clicked", async () => {
    const onModelSelect = vi.fn();
    render(<ModelsList {...defaultProps} onModelSelect={onModelSelect} />);
    await user.click(screen.getByText("Blog"));
    expect(onModelSelect).toHaveBeenCalledWith("m1");
  });

  test("highlights selected model", () => {
    render(<ModelsList {...defaultProps} selectedKey="m1" />);
    // Ant Design Menu adds `ant-menu-item-selected` class to selected item
    const menuItems = screen.getAllByRole("menuitem");
    const selectedItem = menuItems.find(item => item.classList.contains("ant-menu-item-selected"));
    expect(selectedItem).toBeDefined();
  });

  test("shows dot icons when collapsed", () => {
    render(<ModelsList {...defaultProps} collapsed />);
    expect(screen.queryByText("MODELS")).not.toBeInTheDocument();
    expect(screen.queryByText("Blog")).not.toBeInTheDocument();
  });

  test("renders empty state with no models", () => {
    render(<ModelsList {...defaultProps} models={[]} />);
    expect(screen.getByText("MODELS")).toBeVisible();
  });
});

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, test, expect, vi } from "vitest";

import type { Model } from "@reearth-cms/components/molecules/Model/types";

vi.mock("react-drag-listview", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import Models from "./Models";

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
  title: "MODELS",
  collapsed: false,
  models: [makeModel("m1", "Blog"), makeModel("m2", "Product")],
  open: false,
  hasCreateRight: true,
  hasUpdateRight: true,
  onModalOpen: vi.fn(),
  onModelKeyCheck: vi.fn().mockResolvedValue(true),
  onClose: vi.fn(),
  onCreate: vi.fn(),
  onModelSelect: vi.fn(),
  onUpdateModelsOrder: vi.fn(),
};

describe("Models", () => {
  test("renders ModelsList content with model names and header", () => {
    render(<Models {...defaultProps} />);
    expect(screen.getByText("Blog")).toBeVisible();
    expect(screen.getByText("Product")).toBeVisible();
    expect(screen.getByText("MODELS")).toBeVisible();
  });

  test("renders FormModal with New Model title when open", () => {
    render(<Models {...defaultProps} open />);
    expect(screen.getByText("New Model")).toBeInTheDocument();
  });
});

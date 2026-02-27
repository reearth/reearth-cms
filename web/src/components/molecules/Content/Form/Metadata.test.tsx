import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { describe, test, expect, vi } from "vitest";

import type { Item } from "@reearth-cms/components/molecules/Content/types";
import type { MetadataField } from "@reearth-cms/components/molecules/Schema/types";

dayjs.extend(utc);

vi.mock("@reearth-cms/components/molecules/Content/Status", () => ({
  default: ({ status }: { status: string }) => <div data-testid="mock-status">{status}</div>,
}));

vi.mock("./fields/FieldTypesMap", () => ({
  FIELD_TYPE_COMPONENT_MAP: {
    Tag: ({ field, disabled }: { field: { title: string }; disabled: boolean }) => (
      <div data-testid="mock-field">{`${field.title}${disabled ? " (disabled)" : ""}`}</div>
    ),
    Text: ({ field }: { field: { title: string } }) => (
      <div data-testid="mock-field">{field.title}</div>
    ),
  },
}));

import Metadata from "./Metadata";

const makeItem = (overrides?: Partial<Item>): Item => ({
  id: "item-123",
  version: "1",
  title: "Test Item",
  schemaId: "schema-1",
  createdBy: { name: "Alice" },
  updatedBy: { name: "Bob" },
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-02-20T14:00:00Z"),
  status: "DRAFT",
  referencedItems: [],
  fields: [],
  metadata: { version: "1", fields: [] },
  threadId: undefined,
  comments: [],
  assets: [],
  requests: [],
  ...overrides,
});

const makeMetadataField = (overrides?: Partial<MetadataField>): MetadataField => ({
  id: "meta-1",
  type: "Tag",
  title: "Priority",
  key: "priority",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

describe("Metadata", () => {
  test("renders nothing when no item and empty fields", () => {
    const { container } = render(<Metadata item={undefined} fields={[]} disabled={false} />);
    expect(container.textContent).toBe("");
  });

  test("renders item ID", () => {
    render(<Metadata item={makeItem()} fields={[]} disabled={false} />);
    expect(screen.getByText("item-123")).toBeVisible();
  });

  test("renders Created By and Updated By names", () => {
    render(<Metadata item={makeItem()} fields={[]} disabled={false} />);
    expect(screen.getByText("Alice")).toBeVisible();
    expect(screen.getByText("Bob")).toBeVisible();
  });

  test("renders Item Information heading", () => {
    render(<Metadata item={makeItem()} fields={[]} disabled={false} />);
    expect(screen.getByText("Item Information")).toBeVisible();
  });

  test("renders Publish State section with item status", () => {
    render(<Metadata item={makeItem({ status: "PUBLIC" })} fields={[]} disabled={false} />);
    expect(screen.getByText("Publish State")).toBeVisible();
    expect(screen.getByTestId("mock-status")).toHaveTextContent("PUBLIC");
  });

  test("renders metadata fields section when fields are present", () => {
    const fields = [makeMetadataField({ id: "m1", title: "Priority" })];
    render(<Metadata item={undefined} fields={fields} disabled={false} />);
    expect(screen.getByText("Customized meta data")).toBeVisible();
    expect(screen.getByText("Priority")).toBeVisible();
  });

  test("hides metadata fields section when fields array is empty", () => {
    render(<Metadata item={makeItem()} fields={[]} disabled={false} />);
    expect(screen.queryByText("Customized meta data")).not.toBeInTheDocument();
  });

  test("passes disabled prop to metadata field components", () => {
    const fields = [makeMetadataField({ id: "m1", title: "Priority" })];
    render(<Metadata item={undefined} fields={fields} disabled={true} />);
    expect(screen.getByText("Priority (disabled)")).toBeVisible();
  });

  test("renders metadata fields without item", () => {
    const fields = [
      makeMetadataField({ id: "m1", title: "Priority", type: "Tag" }),
      makeMetadataField({ id: "m2", title: "Notes", type: "Text" }),
    ];
    render(<Metadata item={undefined} fields={fields} disabled={false} />);
    expect(screen.queryByText("Item Information")).not.toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeVisible();
    expect(screen.getByText("Notes")).toBeVisible();
  });
});

import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { describe, test, expect, vi } from "vitest";

import type { Request } from "@reearth-cms/components/molecules/Request/types";

import { RequestDescription } from "./RequestDescription";

vi.mock("./ItemForm", () => ({ default: () => <div data-testid="ItemForm" /> }));

dayjs.extend(relativeTime);
dayjs.extend(utc);

const baseRequest: Request = {
  id: "req-1",
  title: "Test Request",
  description: "A description",
  comments: [],
  createdAt: new Date("2024-01-15T10:30:00Z"),
  reviewers: [],
  state: "WAITING",
  createdBy: { id: "u1", name: "Alice", email: "alice@test.com" },
  updatedAt: new Date("2024-01-16T10:30:00Z"),
  items: [],
};

const defaultProps = {
  currentRequest: baseRequest,
  onGetAsset: vi.fn(),
  onGroupGet: vi.fn(),
  onNavigateToItemEdit: vi.fn(),
};

describe("RequestDescription", () => {
  test("renders request title and description", () => {
    render(<RequestDescription {...defaultProps} />);
    expect(screen.getByText("Test Request")).toBeVisible();
    expect(screen.getByText("A description")).toBeVisible();
  });

  test("renders author name", () => {
    render(<RequestDescription {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeVisible();
  });

  test("filters out items without schema", () => {
    const requestWithItems: Request = {
      ...baseRequest,
      items: [
        {
          id: "item-1",
          title: "Item With Schema",
          modelId: "m1",
          modelName: "Model A",
          schema: { id: "s1", fields: [] },
          initialValues: {},
          referencedItems: [],
        },
        {
          id: "item-2",
          title: "Item Without Schema",
          modelId: "m2",
          modelName: "Model B",
          schema: undefined,
          initialValues: {},
          referencedItems: [],
        },
      ],
    };
    render(<RequestDescription {...defaultProps} currentRequest={requestWithItems} />);
    expect(screen.getByText(/Model A/)).toBeVisible();
    expect(screen.queryByText(/Model B/)).not.toBeInTheDocument();
  });
});

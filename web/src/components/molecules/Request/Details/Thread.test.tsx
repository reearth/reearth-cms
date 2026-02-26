import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { describe, test, expect, vi } from "vitest";

import type { Request } from "@reearth-cms/components/molecules/Request/types";

vi.mock("./ItemForm", () => ({ default: () => <div data-testid="ItemForm" /> }));

import RequestThread from "./Thread";

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
  me: { id: "u1", name: "Alice", email: "alice@test.com", lang: "en", auths: [] },
  hasCommentCreateRight: true,
  hasCommentUpdateRight: true,
  hasCommentDeleteRight: true,
  currentRequest: baseRequest,
  onCommentCreate: vi.fn(),
  onCommentUpdate: vi.fn(),
  onCommentDelete: vi.fn(),
  onGetAsset: vi.fn(),
  onGroupGet: vi.fn(),
  onNavigateToItemEdit: vi.fn(),
};

describe("RequestThread", () => {
  test("renders comments when comments array is non-empty", () => {
    const requestWithComments: Request = {
      ...baseRequest,
      comments: [
        {
          id: "c1",
          author: { id: "u1", name: "Alice", type: "User" },
          content: "Hello from thread",
          createdAt: "2024-01-15T10:30:00Z",
        },
      ],
    };
    render(<RequestThread {...defaultProps} currentRequest={requestWithComments} />);
    expect(screen.getByText("Hello from thread")).toBeVisible();
  });

  test("does not render comment content when comments array is empty", () => {
    render(<RequestThread {...defaultProps} />);
    expect(screen.queryByText("Hello from thread")).not.toBeInTheDocument();
  });
});

import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import type { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";

import useLinkItemRequestModal from "./hooks";

const mockRequest: Request = {
  id: "req1",
  title: "Test Request",
  description: "",
  state: "WAITING",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  comments: [],
  items: [],
  createdBy: { id: "user1", name: "Test User", email: "test@example.com" },
  reviewers: [],
};

const mockItems: RequestItem[] = [];

const defaultArgs = {
  items: mockItems,
  onCancel: vi.fn(),
  requestList: [mockRequest],
  totalCount: 10,
  page: 1,
  pageSize: 10,
  onChange: vi.fn().mockResolvedValue(undefined),
};

function renderRequestModal(overrides: Partial<typeof defaultArgs> = {}) {
  const args = { ...defaultArgs, ...overrides };
  return renderHook(() =>
    useLinkItemRequestModal(
      args.items,
      args.onCancel,
      args.requestList,
      args.totalCount,
      args.page,
      args.pageSize,
      args.onChange,
    ),
  );
}

describe("LinkItemRequestModal hooks", () => {
  test("initializes with disabled state and no selected request", () => {
    const { result } = renderRequestModal();
    expect(result.current.isDisabled).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.selectedRequestId).toBeUndefined();
  });

  test("pagination reflects passed props", () => {
    const { result } = renderRequestModal();
    expect(result.current.pagination).toEqual({
      showSizeChanger: true,
      current: 1,
      total: 10,
      pageSize: 10,
    });
  });

  test("select updates selectedRequestId and enables button", () => {
    const { result } = renderRequestModal();

    act(() => {
      result.current.select("req1");
    });
    expect(result.current.selectedRequestId).toBe("req1");
    expect(result.current.isDisabled).toBe(false);
  });

  test("submit calls onChange and resets state on success", async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    const { result } = renderRequestModal({ onChange, onCancel });

    act(() => {
      result.current.select("req1");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(onChange).toHaveBeenCalledWith(mockRequest, mockItems);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(result.current.selectedRequestId).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  test("submit re-enables button on error", async () => {
    const onChange = vi.fn().mockRejectedValue(new Error("fail"));
    const onCancel = vi.fn();
    const { result } = renderRequestModal({ onChange, onCancel });

    act(() => {
      result.current.select("req1");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(result.current.isDisabled).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test("submit does nothing when no request selected", async () => {
    const onChange = vi.fn();
    const { result } = renderRequestModal({ onChange });

    await act(async () => {
      await result.current.submit();
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});

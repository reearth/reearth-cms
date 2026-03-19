import { renderHook, act } from "@testing-library/react";
import { ChangeEvent } from "react";
import { describe, test, expect } from "vitest";

import useLinkItemModal from "./hooks";

describe("LinkItemModal hooks", () => {
  test("initializes with empty value", () => {
    const { result } = renderHook(() => useLinkItemModal(100, 1, 10, true));
    expect(result.current.value).toBe("");
  });

  test("pagination reflects passed props", () => {
    const { result } = renderHook(() => useLinkItemModal(50, 2, 20, true));
    expect(result.current.pagination).toEqual({
      showSizeChanger: true,
      current: 2,
      total: 50,
      pageSize: 20,
    });
  });

  test("handleInput updates value", () => {
    const { result } = renderHook(() => useLinkItemModal(100, 1, 10, true));

    act(() => {
      result.current.handleInput({
        target: { value: "search term" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe("search term");
  });

  test("resets value when visible becomes false", () => {
    const { result, rerender } = renderHook(
      ({ visible }) => useLinkItemModal(100, 1, 10, visible),
      { initialProps: { visible: true } },
    );

    act(() => {
      result.current.handleInput({
        target: { value: "search term" },
      } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe("search term");

    rerender({ visible: false });
    expect(result.current.value).toBe("");
  });

  test("pagination updates when props change", () => {
    const { result, rerender } = renderHook(
      ({ total, page, pageSize }) => useLinkItemModal(total, page, pageSize, true),
      { initialProps: { total: 50, page: 1, pageSize: 10 } },
    );

    expect(result.current.pagination.total).toBe(50);

    rerender({ total: 100, page: 3, pageSize: 25 });
    expect(result.current.pagination).toEqual({
      showSizeChanger: true,
      current: 3,
      total: 100,
      pageSize: 25,
    });
  });
});

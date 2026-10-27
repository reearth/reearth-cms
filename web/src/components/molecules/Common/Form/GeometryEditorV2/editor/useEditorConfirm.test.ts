import { renderHook } from "@testing-library/react";
import { Modal } from "antd";
import type { ModalFuncProps } from "antd";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useEditorConfirm } from "./useEditorConfirm";

describe("useEditorConfirm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a dialog counts as open until it has fully closed", () => {
    const opened: ModalFuncProps[] = [];
    vi.spyOn(Modal, "confirm").mockImplementation(config => {
      opened.push(config);
      return { destroy: vi.fn(), update: vi.fn() };
    });
    const afterClose = vi.fn();
    const { result } = renderHook(() => useEditorConfirm());

    expect(result.current.isDialogOpen()).toBe(false);
    result.current.confirm({ title: "Discard?", afterClose });
    expect(result.current.isDialogOpen()).toBe(true);

    opened[0].afterClose?.();
    expect(result.current.isDialogOpen()).toBe(false);
    // The caller's own afterClose still runs.
    expect(afterClose).toHaveBeenCalled();
  });
});

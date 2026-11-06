import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ModalFuncProps } from "antd";
import type { ArgsProps } from "antd/es/notification";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Test } from "@reearth-cms/test/utils";

import { createGeoStore } from "../core/geoStore";
import { EditOrigin } from "../core/types";

import { REPLACE_WARNING_KEY, useReplaceGuard } from "./useReplaceGuard";

type SetupOptions = {
  multiple?: boolean;
  hasValue?: boolean;
};

const setup = ({ multiple = false, hasValue = true }: SetupOptions = {}) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const confirm = vi.fn<(config: ModalFuncProps) => void>();
  const proceed = vi.fn();
  const { result } = renderHook(() => useReplaceGuard(store, multiple, hasValue, confirm));
  return { store, confirm, proceed, guard: result.current };
};

describe("useReplaceGuard", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each<[string, SetupOptions, boolean]>([
    ["the field holds many geometries", { multiple: true }, false],
    ["the field has no value yet", { hasValue: false }, false],
    ["the warning has been turned off", {}, true],
  ])("replaces at once when %s", (_, options, warningOff) => {
    localStorage.setItem(REPLACE_WARNING_KEY, String(warningOff));
    const { guard, confirm, proceed } = setup(options);
    guard.confirmReplace(proceed);
    expect(proceed).toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  test("otherwise asks first, and replaces only once confirmed", () => {
    const { guard, confirm, proceed } = setup();
    guard.confirmReplace(proceed);
    expect(proceed).not.toHaveBeenCalled();
    confirm.mock.calls[0][0].onOk?.();
    expect(proceed).toHaveBeenCalled();
  });

  test('"Do not show this again" turns the warning off, and back on', async () => {
    const user = userEvent.setup();
    const { guard, confirm, proceed } = setup();
    guard.confirmReplace(proceed);
    render(<>{confirm.mock.calls[0][0].content as ReactNode}</>);
    const checkbox = screen.getByRole("checkbox", { name: "Do not show this again" });

    await user.click(checkbox);
    expect(localStorage.getItem(REPLACE_WARNING_KEY)).toBe("true");
    await user.click(checkbox);
    expect(localStorage.getItem(REPLACE_WARNING_KEY)).toBeNull();
  });

  test("the replaced notice's Undo brings the previous geometry back", async () => {
    const user = userEvent.setup();
    const info = vi.spyOn(Notification, "info").mockImplementation(() => undefined);
    const destroy = vi.spyOn(Notification, "destroy").mockImplementation(() => undefined);
    const { store, guard } = setup();
    store.addFeature(Test.GEO_JSON_POINT, EditOrigin.MAP);
    store.replaceAll(Test.GEO_JSON_LINE_STRING, EditOrigin.MAP);

    guard.notifyReplaced();
    const notice = info.mock.calls[0][0] as ArgsProps;
    expect(notice.message).toBe("Replaced the previous geometry");
    render(<>{notice.btn}</>);
    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(store.getSnapshot().collection.features.map(f => f.geometry)).toEqual([
      Test.GEO_JSON_POINT,
    ]);
    expect(destroy).toHaveBeenCalledWith(notice.key);
  });
});

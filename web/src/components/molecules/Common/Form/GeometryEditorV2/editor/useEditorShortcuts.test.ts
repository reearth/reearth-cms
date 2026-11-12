import { fireEvent, renderHook } from "@testing-library/react";
import Feature from "ol/Feature";
import Draw from "ol/interaction/Draw";
import type { RefObject } from "react";
import { describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { createGeoStore } from "../core/geoStore";
import { EditOrigin } from "../core/types";
import { MapTool } from "../map/mapTools";

import { useEditorShortcuts } from "./useEditorShortcuts";

type SetupOptions = {
  tool?: MapTool;
  readOnly?: boolean;
  dialogOpen?: boolean;
  draw?: Draw | null;
};

const setup = ({
  tool = MapTool.SELECT,
  readOnly = false,
  dialogOpen = false,
  draw = null,
}: SetupOptions = {}) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const id = store.addFeature(Test.GEO_JSON_POINT, EditOrigin.MAP);
  const drawRef: RefObject<Draw | null> = { current: draw };
  const options = {
    store,
    tool,
    setTool: vi.fn(),
    drawRef,
    readOnly,
    requestClose: vi.fn(),
    deleteShape: vi.fn(),
    isDialogOpen: () => dialogOpen,
  };
  const { unmount } = renderHook(() => useEditorShortcuts(options));
  return { ...options, id, unmount };
};

/** A line tool with a line half drawn, as if the map had been clicked. */
const drawingLine = (): Draw => {
  const draw = new Draw({ type: "LineString" });
  (draw as unknown as { sketchFeature_: Feature }).sketchFeature_ = new Feature();
  return draw;
};

const press = (key: string, init: KeyboardEventInit = {}, target: Element = document.body) =>
  fireEvent.keyDown(target, { key, ...init });

describe("useEditorShortcuts", () => {
  test("Esc deselects first, then asks to close", () => {
    const { store, requestClose } = setup();
    press("Escape");
    expect(store.getSnapshot().selectedId).toBeNull();
    expect(requestClose).not.toHaveBeenCalled();
    press("Escape");
    expect(requestClose).toHaveBeenCalled();
  });

  test("Esc in a drawing tool with nothing drawn goes back to Select", () => {
    const { setTool } = setup({ tool: MapTool.POINT });
    press("Escape");
    expect(setTool).toHaveBeenCalledWith(MapTool.SELECT);
  });

  test("Esc while a line is half drawn drops the line and stays in the tool", () => {
    const { setTool, store } = setup({ tool: MapTool.LINE, draw: drawingLine() });
    press("Escape");
    expect(setTool).not.toHaveBeenCalled();
    expect(store.getSnapshot().selectedId).not.toBeNull();
  });

  test("Ctrl/⌘+Z undoes, Shift redoes", () => {
    const { store } = setup();
    press("z", { ctrlKey: true });
    expect(store.getSnapshot().collection.features).toHaveLength(0);
    press("z", { metaKey: true, shiftKey: true });
    expect(store.getSnapshot().collection.features).toHaveLength(1);
  });

  test("Ctrl/⌘+Y redoes too", () => {
    const { store } = setup();
    press("z", { ctrlKey: true });
    press("y", { ctrlKey: true });
    expect(store.getSnapshot().collection.features).toHaveLength(1);
  });

  test.each(["Delete", "Backspace"])("%s removes the selected shape", key => {
    const { id, deleteShape } = setup();
    press(key);
    expect(deleteShape).toHaveBeenCalledWith(id);
  });

  test("Backspace in a drawing tool removes the last point instead", () => {
    const removeLastPoint = vi.fn();
    const { deleteShape } = setup({
      tool: MapTool.LINE,
      draw: { removeLastPoint } as unknown as Draw,
    });
    press("Backspace");
    expect(removeLastPoint).toHaveBeenCalled();
    expect(deleteShape).not.toHaveBeenCalled();
  });

  test("keys typed into a field are left alone", () => {
    const { store, deleteShape } = setup();
    const input = document.createElement("input");
    document.body.append(input);
    press("Delete", {}, input);
    press("Escape", {}, input);
    expect(deleteShape).not.toHaveBeenCalled();
    expect(store.getSnapshot().selectedId).not.toBeNull();
    input.remove();
  });

  test("read-only allows only Esc", () => {
    const { store, deleteShape } = setup({ readOnly: true });
    press("z", { ctrlKey: true });
    press("Delete");
    expect(store.getSnapshot().collection.features).toHaveLength(1);
    expect(deleteShape).not.toHaveBeenCalled();
  });

  test("an open confirm dialog keeps its keys", () => {
    const { store, requestClose } = setup({ dialogOpen: true });
    press("Escape");
    press("z", { ctrlKey: true });
    expect(store.getSnapshot().selectedId).not.toBeNull();
    expect(store.getSnapshot().collection.features).toHaveLength(1);
    expect(requestClose).not.toHaveBeenCalled();
  });

  test("keys do nothing once the editor has closed", () => {
    const { store, deleteShape, unmount } = setup();
    unmount();
    press("Delete");
    press("z", { ctrlKey: true });
    expect(deleteShape).not.toHaveBeenCalled();
    expect(store.getSnapshot().collection.features).toHaveLength(1);
  });
});

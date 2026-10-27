import { fireEvent, renderHook } from "@testing-library/react";
import type Draw from "ol/interaction/Draw";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";

import { createGeoStore } from "../core/geoStore";
import { EditOrigin } from "../core/types";
import { MapTool } from "../map/mapTools";

import { useEditorShortcuts } from "./useEditorShortcuts";

const setup = ({ tool = MapTool.SELECT, readOnly = false } = {}) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const id = store.addFeature({ type: "Point", coordinates: [1, 1] }, EditOrigin.MAP);
  const options = {
    store,
    tool,
    setTool: vi.fn(),
    drawRef: createRef<Draw>(),
    readOnly,
    requestClose: vi.fn(),
    deleteShape: vi.fn(),
  };
  renderHook(() => useEditorShortcuts(options));
  return { ...options, id };
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

  test("Ctrl/⌘+Z undoes, Shift redoes", () => {
    const { store } = setup();
    press("z", { ctrlKey: true });
    expect(store.getSnapshot().collection.features).toHaveLength(0);
    press("z", { metaKey: true, shiftKey: true });
    expect(store.getSnapshot().collection.features).toHaveLength(1);
  });

  test("Delete removes the selected shape", () => {
    const { id, deleteShape } = setup();
    press("Delete");
    expect(deleteShape).toHaveBeenCalledWith(id);
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
});

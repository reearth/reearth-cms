import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { createGeoStore } from "../core/geoStore";
import { GeoStoreProvider } from "../core/StoreContext";
import { EditOrigin } from "../core/types";

import GeoJsonPanel from "./GeoJsonPanel";
import type { GeoJsonPanelHandle } from "./GeoJsonPanel";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    onMount,
  }: {
    value: string;
    onChange: (value: string) => void;
    onMount: (instance: { hasTextFocus: () => boolean }) => void;
  }) => {
    onMount({ hasTextFocus: () => false });
    return (
      <textarea aria-label="GeoJSON text" value={value} onChange={e => onChange(e.target.value)} />
    );
  },
}));

vi.mock("@reearth-cms/utils/monacoJsonSchemas", () => ({ registerJsonSchema: vi.fn() }));

const setup = (open = true) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  store.addFeature(Test.GEO_JSON_POINT, EditOrigin.MAP);
  const ref = createRef<GeoJsonPanelHandle>();
  const onIssuesChange = vi.fn();
  render(
    <GeoStoreProvider value={store}>
      <GeoJsonPanel
        ref={ref}
        multiple={false}
        readOnly={false}
        open={open}
        validateOptions={{}}
        onToggle={vi.fn()}
        onIssuesChange={onIssuesChange}
      />
    </GeoStoreProvider>,
  );
  const type = (text: string) =>
    fireEvent.change(screen.getByLabelText("GeoJSON text"), { target: { value: text } });
  const geometry = () => store.getSnapshot().collection.features[0]?.geometry;
  return { store, ref, onIssuesChange, type, geometry };
};

describe("GeoJsonPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows only the header when collapsed", () => {
    setup(false);
    expect(screen.queryByLabelText("GeoJSON text")).not.toBeInTheDocument();
  });

  test("valid text reaches the map after the debounce", () => {
    const { type, geometry } = setup();
    type('{"type":"Point","coordinates":[2,2]}');
    expect(geometry()).toEqual(Test.GEO_JSON_POINT);
    act(() => vi.advanceTimersByTime(500));
    expect(geometry()).toEqual({ type: "Point", coordinates: [2, 2] });
  });

  test("invalid text keeps the last valid value and reports the problem", () => {
    const { type, geometry, onIssuesChange } = setup();
    type('{"type":"Point","coordinates":[200,0]}');
    act(() => vi.advanceTimersByTime(500));
    expect(geometry()).toEqual(Test.GEO_JSON_POINT);
    expect(screen.getByRole("alert")).toHaveTextContent("Longitude must be between -180 and 180");
    expect(onIssuesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ path: "coordinates" }),
    ]);
  });

  test("flush applies valid text that is still waiting", () => {
    const { ref, type, geometry } = setup();
    type('{"type":"Point","coordinates":[3,3]}');
    let flushed = false;
    act(() => {
      flushed = ref.current?.flush() ?? false;
    });
    expect(flushed).toBe(true);
    expect(geometry()).toEqual({ type: "Point", coordinates: [3, 3] });
  });

  test("flush refuses invalid text that is still waiting", () => {
    const { ref, type, geometry } = setup();
    type("{ not json");
    let flushed = true;
    act(() => {
      flushed = ref.current?.flush() ?? true;
    });
    expect(flushed).toBe(false);
    expect(geometry()).toEqual(Test.GEO_JSON_POINT);
  });

  test("flush with nothing pending is a no-op", () => {
    const { ref, store } = setup();
    const revision = store.getSnapshot().revision;
    expect(ref.current?.flush()).toBe(true);
    expect(store.getSnapshot().revision).toBe(revision);
  });
});

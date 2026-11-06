import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { createGeoStore } from "../core/geoStore";
import { GeoStoreProvider } from "../core/StoreContext";
import { EditOrigin } from "../core/types";
import type { GeometryIssue } from "../core/validation";

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

type SetupOptions = {
  open?: boolean;
  multiple?: boolean;
  readOnly?: boolean;
  initialInvalid?: { text: string; issues: GeometryIssue[] };
};

const setup = ({
  open = true,
  multiple = false,
  readOnly = false,
  initialInvalid,
}: SetupOptions = {}) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  store.addFeature(Test.GEO_JSON_POINT, EditOrigin.MAP);
  const ref = createRef<GeoJsonPanelHandle>();
  const onIssuesChange = vi.fn();
  render(
    <GeoStoreProvider value={store}>
      <GeoJsonPanel
        ref={ref}
        multiple={multiple}
        readOnly={readOnly}
        open={open}
        validateOptions={{}}
        initialInvalid={initialInvalid}
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
    setup({ open: false });
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

  test("a map edit shows up in the text while the text isn't being edited", () => {
    const { store } = setup();
    act(() => store.setGeometry("s1", Test.GEO_JSON_LINE_STRING, EditOrigin.MAP));
    expect(
      JSON.parse((screen.getByLabelText("GeoJSON text") as HTMLTextAreaElement).value),
    ).toEqual(Test.GEO_JSON_LINE_STRING);
  });

  test("a multiple field shows a list, and a typed list commits every geometry", () => {
    const { store, type } = setup({ multiple: true });
    expect(
      JSON.parse((screen.getByLabelText("GeoJSON text") as HTMLTextAreaElement).value),
    ).toEqual([Test.GEO_JSON_POINT]);
    type(JSON.stringify([Test.GEO_JSON_POINT, Test.GEO_JSON_POLYGON]));
    act(() => vi.advanceTimersByTime(500));
    expect(store.getSnapshot().collection.features.map(f => f.geometry)).toEqual([
      Test.GEO_JSON_POINT,
      Test.GEO_JSON_POLYGON,
    ]);
  });

  test.each<[string, boolean, number]>([
    ["an editable panel offers Format and Copy", false, 1],
    ["a read-only panel offers only Copy", true, 0],
  ])("%s", (_, readOnly, formatButtons) => {
    setup({ readOnly });
    expect(screen.queryAllByRole("button", { name: "Format GeoJSON" })).toHaveLength(formatButtons);
    expect(screen.getByRole("button", { name: "Copy GeoJSON" })).toBeInTheDocument();
  });

  test("a stored value that can't be read opens with its raw text and its problem", () => {
    const text = '{"type":"Point","coordinates":[200,0]}';
    const issues = [{ path: "coordinates", message: "Longitude must be between -180 and 180" }];
    setup({ initialInvalid: { text, issues } });
    expect(screen.getByLabelText("GeoJSON text")).toHaveValue(text);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "coordinates: Longitude must be between -180 and 180",
    );
  });

  describe("stale bbox", () => {
    const STALE = "The bbox doesn't contain this geometry. It will be saved as is.";
    const staleLine = { ...Test.GEO_JSON_LINE_STRING_WITH_BBOX, bbox: [0, 0, 1, 1] };

    test("is saved as written, with a warning", () => {
      const { type, geometry, onIssuesChange } = setup();
      type(JSON.stringify(staleLine));
      act(() => vi.advanceTimersByTime(500));
      expect(geometry()).toEqual(staleLine);
      expect(screen.getByRole("alert")).toHaveTextContent(`bbox: ${STALE}`);
      // A warning doesn't block Apply.
      expect(onIssuesChange).toHaveBeenLastCalledWith([]);
    });

    test("the warning clears once the bbox is fixed", () => {
      const { type } = setup();
      type(JSON.stringify(staleLine));
      act(() => vi.advanceTimersByTime(500));
      type(JSON.stringify(Test.GEO_JSON_LINE_STRING_WITH_BBOX));
      act(() => vi.advanceTimersByTime(500));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("the warning clears once a map edit recomputes the bbox", () => {
      const { store, type } = setup();
      type(JSON.stringify(staleLine));
      act(() => vi.advanceTimersByTime(500));
      act(() => store.setGeometry("s1", Test.GEO_JSON_LINE_STRING_WITH_BBOX, EditOrigin.MAP));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("an error takes the place of the warning", () => {
      const { type } = setup();
      type(JSON.stringify(staleLine));
      act(() => vi.advanceTimersByTime(500));
      type('{"type":"Point","coordinates":[200,0]}');
      act(() => vi.advanceTimersByTime(500));
      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toHaveTextContent("Longitude must be between -180 and 180");
    });
  });
});

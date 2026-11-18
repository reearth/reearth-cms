import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import type { StoredValue } from "./core/fieldValue";
import GeometryMiniMap from "./GeometryMiniMap";

// OpenLayers can't render in jsdom; what matters here is map versus fallback.
vi.mock("./map/useOlMap", () => ({ useOlMap: () => null }));

const FALLBACK = "raw value";
const ZOOM_HINT = "Ctrl/Cmd + scroll to zoom";

describe("GeometryMiniMap", () => {
  test.each<[string, StoredValue, boolean]>([
    ["a geometry", Test.GEO_JSON_POINT, false],
    ["a list of geometries", [Test.GEO_JSON_POINT, Test.GEO_JSON_LINE_STRING], true],
    ["a legacy GeoJSON string", JSON.stringify(Test.GEO_JSON_POINT), false],
    [
      "a legacy list of GeoJSON strings",
      [JSON.stringify(Test.GEO_JSON_POINT), JSON.stringify(Test.GEO_JSON_LINE_STRING)],
      true,
    ],
  ])("shows a map for %s", (_, value, multiple) => {
    render(<GeometryMiniMap value={value} multiple={multiple} fallback={FALLBACK} />);
    expect(screen.getByText(ZOOM_HINT)).toBeInTheDocument();
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument();
  });

  test("falls back for a value that can't be read", () => {
    render(<GeometryMiniMap value="{not json" multiple={false} fallback={FALLBACK} />);
    expect(screen.getByText(FALLBACK)).toBeInTheDocument();
    expect(screen.queryByText(ZOOM_HINT)).not.toBeInTheDocument();
  });

  test("falls back for a value that isn't a valid geometry", () => {
    render(
      <GeometryMiniMap
        value='{"type":"Point","coordinates":[25.1,121.6]}'
        multiple={false}
        fallback={FALLBACK}
      />,
    );
    expect(screen.getByText(FALLBACK)).toBeInTheDocument();
    expect(screen.queryByText(ZOOM_HINT)).not.toBeInTheDocument();
  });
});

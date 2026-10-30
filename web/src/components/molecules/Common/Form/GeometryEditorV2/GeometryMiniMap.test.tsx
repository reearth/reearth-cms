import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import GeometryMiniMap from "./GeometryMiniMap";

// OpenLayers can't render in jsdom; what matters here is map versus fallback.
vi.mock("./map/useOlMap", () => ({ useOlMap: () => null }));

const FALLBACK = "raw value";

describe("GeometryMiniMap", () => {
  test("shows a map for a valid value", () => {
    render(
      <GeometryMiniMap
        value={JSON.stringify(Test.GEO_JSON_POINT)}
        multiple={false}
        fallback={FALLBACK}
      />,
    );
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument();
  });

  test("shows a map for a multiple value", () => {
    render(
      <GeometryMiniMap
        value={[JSON.stringify(Test.GEO_JSON_POINT), JSON.stringify(Test.GEO_JSON_LINE_STRING)]}
        multiple
        fallback={FALLBACK}
      />,
    );
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument();
  });

  test("falls back for a value that can't be read", () => {
    render(<GeometryMiniMap value="{not json" multiple={false} fallback={FALLBACK} />);
    expect(screen.getByText(FALLBACK)).toBeInTheDocument();
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
  });
});

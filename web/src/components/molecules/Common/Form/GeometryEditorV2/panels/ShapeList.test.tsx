import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { createGeoStore } from "../core/geoStore";
import { GeoStoreProvider } from "../core/StoreContext";
import { EditOrigin, FocusKind } from "../core/types";

import ShapeList from "./ShapeList";

const setup = () => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const pointId = store.addFeature(Test.GEO_JSON_POINT, EditOrigin.MAP);
  const lineId = store.addFeature(Test.GEO_JSON_LINE_STRING, EditOrigin.MAP);
  store.select(null);
  render(
    <GeoStoreProvider value={store}>
      <ShapeList multiple readOnly={false} drawHint="" onDelete={vi.fn()} />
    </GeoStoreProvider>,
  );
  return { store, pointId, lineId };
};

const rows = () => screen.getAllByRole("option");

const renderReadOnlyShape = (readOnly: boolean) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  store.addFeature(Test.GEO_JSON_MULTI_POINT, EditOrigin.MAP);
  render(
    <GeoStoreProvider value={store}>
      <ShapeList multiple readOnly={readOnly} drawHint="" onDelete={vi.fn()} />
    </GeoStoreProvider>,
  );
};

const GEOJSON_NOTE = "Can't be edited on the map. Change it in GeoJSON.";

describe("ShapeList", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  test("lists each shape with its type", () => {
    setup();
    expect(rows()).toHaveLength(2);
    expect(rows()[0]).toHaveTextContent("Point");
    expect(rows()[1]).toHaveTextContent("Line");
  });

  test("selecting a row selects the shape and zooms to it, every time", async () => {
    const user = userEvent.setup();
    const { store, lineId } = setup();

    await user.click(rows()[1]);
    expect(store.getSnapshot().selectedId).toBe(lineId);
    const focus = store.getSnapshot().focus;
    expect(focus).toMatchObject({ kind: FocusKind.GEOMETRY, geometry: Test.GEO_JSON_LINE_STRING });

    await user.click(rows()[1]);
    expect(store.getSnapshot().focus?.nonce).toBe((focus?.nonce ?? 0) + 1);
  });

  test("selecting on the map selects the row", () => {
    const { store, pointId } = setup();
    act(() => store.select(pointId));
    expect(rows()[0]).toHaveAttribute("aria-selected", "true");
    expect(rows()[1]).toHaveAttribute("aria-selected", "false");
  });

  test("points a read-only shape to GeoJSON only for someone who can edit", () => {
    renderReadOnlyShape(false);
    expect(screen.getByText(GEOJSON_NOTE)).toBeInTheDocument();
  });

  test("says nothing about GeoJSON when the whole editor is read-only", () => {
    renderReadOnlyShape(true);
    expect(screen.queryByText(GEOJSON_NOTE)).not.toBeInTheDocument();
  });

  test("keyboard selection works like a click", async () => {
    const user = userEvent.setup();
    const { store, pointId } = setup();
    rows()[0].focus();
    await user.keyboard("{Enter}");
    expect(store.getSnapshot().selectedId).toBe(pointId);
  });
});

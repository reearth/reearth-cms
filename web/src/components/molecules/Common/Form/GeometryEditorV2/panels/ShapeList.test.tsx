import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { createGeoStore } from "../core/geoStore";
import { GeoStoreProvider } from "../core/StoreContext";
import { EditOrigin } from "../core/types";

import ShapeList from "./ShapeList";

const POINT = { type: "Point" as const, coordinates: [139.7, 35.6] };
const LINE = {
  type: "LineString" as const,
  coordinates: [
    [139.7, 35.6],
    [139.8, 35.7],
  ],
};

const setup = () => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const pointId = store.addFeature(POINT, EditOrigin.MAP);
  const lineId = store.addFeature(LINE, EditOrigin.MAP);
  store.select(null);
  render(
    <GeoStoreProvider value={store}>
      <ShapeList multiple readOnly={false} drawHint="" onDelete={vi.fn()} />
    </GeoStoreProvider>,
  );
  return { store, pointId, lineId };
};

const rows = () => screen.getAllByRole("option");

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
    expect(focus).toMatchObject({ kind: "geometry", geometry: LINE });

    await user.click(rows()[1]);
    expect(store.getSnapshot().focus?.nonce).toBe((focus?.nonce ?? 0) + 1);
  });

  test("selecting on the map selects the row", () => {
    const { store, pointId } = setup();
    act(() => store.select(pointId));
    expect(rows()[0]).toHaveAttribute("aria-selected", "true");
    expect(rows()[1]).toHaveAttribute("aria-selected", "false");
  });

  test("keyboard selection works like a click", async () => {
    const user = userEvent.setup();
    const { store, pointId } = setup();
    rows()[0].focus();
    await user.keyboard("{Enter}");
    expect(store.getSnapshot().selectedId).toBe(pointId);
  });
});

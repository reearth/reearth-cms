import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Geometry } from "geojson";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import { createGeoStore } from "../core/geoStore";
import { GeoStoreProvider } from "../core/StoreContext";
import { EditOrigin, FocusKind } from "../core/types";

import ShapeList from "./ShapeList";

const DRAW_HINT = "Draw on the map to add one.";

type SetupOptions = {
  geometries?: Geometry[];
  multiple?: boolean;
  readOnly?: boolean;
};

const setup = ({
  geometries = [Test.GEO_JSON_POINT, Test.GEO_JSON_LINE_STRING],
  multiple = true,
  readOnly = false,
}: SetupOptions = {}) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const ids = geometries.map(geometry => store.addFeature(geometry, EditOrigin.MAP));
  store.select(null);
  const onDelete = vi.fn();
  render(
    <GeoStoreProvider value={store}>
      <ShapeList multiple={multiple} readOnly={readOnly} drawHint={DRAW_HINT} onDelete={onDelete} />
    </GeoStoreProvider>,
  );
  return { store, ids, onDelete };
};

const rows = () => screen.getAllByRole("option");

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
    const { store, ids } = setup();

    await user.click(rows()[1]);
    expect(store.getSnapshot().selectedId).toBe(ids[1]);
    const focus = store.getSnapshot().focus;
    expect(focus).toMatchObject({ kind: FocusKind.GEOMETRY, geometry: Test.GEO_JSON_LINE_STRING });

    await user.click(rows()[1]);
    expect(store.getSnapshot().focus?.nonce).toBe((focus?.nonce ?? 0) + 1);
  });

  test("selecting on the map selects the row", () => {
    const { store, ids } = setup();
    act(() => store.select(ids[0]));
    expect(rows()[0]).toHaveAttribute("aria-selected", "true");
    expect(rows()[1]).toHaveAttribute("aria-selected", "false");
  });

  test("keyboard selection works like a click", async () => {
    const user = userEvent.setup();
    const { store, ids } = setup();
    rows()[0].focus();
    await user.keyboard("{Enter}");
    expect(store.getSnapshot().selectedId).toBe(ids[0]);
  });

  test.each<[string, boolean, number]>([
    ["points a read-only shape to GeoJSON for someone who can edit", false, 1],
    ["says nothing about GeoJSON when the whole editor is read-only", true, 0],
  ])("%s", (_, readOnly, notes) => {
    setup({ geometries: [Test.GEO_JSON_MULTI_POINT], readOnly });
    expect(screen.queryAllByText(GEOJSON_NOTE)).toHaveLength(notes);
  });

  test.each<[string, boolean, string[]]>([
    ["numbers rows in a multiple field", true, ["1", "2"]],
    ["leaves rows unnumbered in a single field", false, []],
  ])("%s", (_, multiple, numbers) => {
    setup({ multiple });
    expect(rows().flatMap(row => within(row).queryAllByText(/^\d+$/))).toHaveLength(numbers.length);
    numbers.forEach((number, i) => {
      expect(within(rows()[i]).getByText(number)).toBeInTheDocument();
    });
  });

  test("Delete asks to remove that shape without selecting it", async () => {
    const user = userEvent.setup();
    const { store, ids, onDelete } = setup();
    await user.click(screen.getAllByRole("button", { name: "Delete geometry" })[1]);
    expect(onDelete).toHaveBeenCalledWith(ids[1]);
    expect(store.getSnapshot().selectedId).toBeNull();
  });

  test("a read-only list offers no Delete", () => {
    setup({ readOnly: true });
    expect(screen.queryAllByRole("button", { name: "Delete geometry" })).toHaveLength(0);
  });

  test("Fly to zooms to the shape without selecting it", async () => {
    const user = userEvent.setup();
    const { store } = setup();
    await user.click(screen.getAllByRole("button", { name: "Fly to geometry" })[1]);
    expect(store.getSnapshot().focus).toMatchObject({
      kind: FocusKind.GEOMETRY,
      geometry: Test.GEO_JSON_LINE_STRING,
    });
    expect(store.getSnapshot().selectedId).toBeNull();
  });

  test.each<[string, boolean, number]>([
    ["shows the draw hint when there are no shapes", false, 1],
    ["leaves out the draw hint when read-only", true, 0],
  ])("%s", (_, readOnly, hints) => {
    setup({ geometries: [], readOnly });
    expect(screen.getByText("No geometries yet")).toBeInTheDocument();
    expect(screen.queryAllByText(DRAW_HINT)).toHaveLength(hints);
  });
});

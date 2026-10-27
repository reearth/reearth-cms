import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { createGeoStore } from "../core/geoStore";
import { GeoStoreProvider } from "../core/StoreContext";
import { EditOrigin } from "../core/types";

import CoordinatesPanel from "./CoordinatesPanel";

const POINT = { type: "Point" as const, coordinates: [139.7, 35.6] };
const LINE = {
  type: "LineString" as const,
  coordinates: [
    [139.7, 35.6],
    [139.8, 35.7],
  ],
};

const setup = ({ open = true, readOnly = false } = {}) => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const pointId = store.addFeature(POINT, EditOrigin.MAP);
  const lineId = store.addFeature(LINE, EditOrigin.MAP);
  store.select(null);
  const onToggle = vi.fn();
  render(
    <GeoStoreProvider value={store}>
      <CoordinatesPanel open={open} readOnly={readOnly} onToggle={onToggle} />
    </GeoStoreProvider>,
  );
  const point = () => store.getSnapshot().collection.features[0].geometry;
  return { store, pointId, lineId, onToggle, point };
};

const latitude = () => screen.getByRole("spinbutton", { name: "Latitude" });
const longitude = () => screen.getByRole("spinbutton", { name: "Longitude" });

describe("CoordinatesPanel", () => {
  test("collapsed shows only the header, which toggles it", async () => {
    const user = userEvent.setup();
    const { onToggle } = setup({ open: false });
    expect(screen.queryByText("Select a shape to edit its coordinates.")).not.toBeInTheDocument();
    const header = screen.getByRole("button", { name: /Coordinates/ });
    expect(header).toHaveAttribute("aria-expanded", "false");
    await user.click(header);
    expect(onToggle).toHaveBeenCalled();
  });

  test("asks for a selection when nothing is selected", () => {
    setup();
    expect(screen.getByText("Select a shape to edit its coordinates.")).toBeInTheDocument();
  });

  test("Enter applies a point's new coordinate", async () => {
    const user = userEvent.setup();
    const { store, pointId, point } = setup();
    act(() => store.select(pointId));
    await user.clear(latitude());
    await user.type(latitude(), "36.1{Enter}");
    expect(point()).toEqual({ type: "Point", coordinates: [139.7, 36.1] });
  });

  test("blur applies, Esc reverts", async () => {
    const user = userEvent.setup();
    const { store, pointId, point } = setup();
    act(() => store.select(pointId));

    await user.clear(longitude());
    await user.type(longitude(), "140");
    await user.tab();
    expect(point()).toEqual({ type: "Point", coordinates: [140, 35.6] });

    await user.clear(latitude());
    await user.type(latitude(), "10{Escape}");
    expect(latitude()).toHaveValue("35.6");
    await user.tab();
    expect(point()).toEqual({ type: "Point", coordinates: [140, 35.6] });
  });

  test("an out-of-range number is not applied", async () => {
    const user = userEvent.setup();
    const { store, pointId, point } = setup();
    act(() => store.select(pointId));
    await user.clear(latitude());
    await user.type(latitude(), "91{Enter}");
    expect(point()).toEqual(POINT);
  });

  test("follows changes made elsewhere, such as on the map", () => {
    const { store, pointId } = setup();
    act(() => store.select(pointId));
    act(() => store.setGeometry(pointId, { type: "Point", coordinates: [1, 2] }, EditOrigin.MAP));
    expect(latitude()).toHaveValue("2");
    expect(longitude()).toHaveValue("1");
  });

  test("a line asks for a vertex, then shows only that vertex", () => {
    const { store, lineId } = setup();
    act(() => store.select(lineId));
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(
      screen.getByText("Select a vertex on the map to edit its coordinates."),
    ).toBeInTheDocument();

    act(() => store.selectVertex(1));
    expect(screen.getByText("Vertex 2")).toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
    expect(latitude()).toHaveValue("35.7");
    expect(longitude()).toHaveValue("139.8");
  });

  test("editing a vertex changes only that vertex", async () => {
    const user = userEvent.setup();
    const { store, lineId } = setup();
    act(() => {
      store.select(lineId);
      store.selectVertex(0);
    });
    await user.clear(latitude());
    await user.type(latitude(), "36{Enter}");
    expect(store.getSnapshot().collection.features[1].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [139.7, 36],
        [139.8, 35.7],
      ],
    });
    expect(store.getSnapshot().selectedVertex).toBe(0);
  });

  test("points multipart shapes to GeoJSON", () => {
    const { store } = setup();
    act(() => {
      store.addFeature({ type: "MultiPoint", coordinates: [[1, 1]] }, EditOrigin.MAP);
    });
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(
      screen.getByText("This shape can't be edited here. Edit it in GeoJSON."),
    ).toBeInTheDocument();
  });

  test("read-only shows coordinates without letting them change", () => {
    const { store, pointId, lineId } = setup({ readOnly: true });
    act(() => store.select(pointId));
    expect(latitude()).toBeDisabled();
    act(() => {
      store.select(lineId);
      store.selectVertex(0);
    });
    expect(latitude()).toBeDisabled();
  });
});

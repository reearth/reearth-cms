import { act, renderHook } from "@testing-library/react";
import type Point from "ol/geom/Point";
import { toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { afterEach, describe, expect, test, vi } from "vitest";

import Notification from "@reearth-cms/components/atoms/Notification";

import { createGeoStore } from "../core/geoStore";
import { FocusKind } from "../core/types";

import { useMyLocation } from "./useMyLocation";
import type { MapHandles } from "./useOlMap";

const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;

const mockGeolocation = (getCurrentPosition: Geolocation["getCurrentPosition"]) => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });
};

const failWith =
  (code: number): Geolocation["getCurrentPosition"] =>
  (_, onError) =>
    onError?.({
      code,
      message: "",
      PERMISSION_DENIED,
      POSITION_UNAVAILABLE,
      TIMEOUT: 3,
    } as GeolocationPositionError);

const setup = () => {
  const store = createGeoStore({ type: "FeatureCollection", features: [] });
  const { result } = renderHook(() => useMyLocation(null, store));
  return { store, result };
};

describe("useMyLocation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, "geolocation");
  });

  test("moves the map to the user's location without adding a shape", () => {
    mockGeolocation(onSuccess =>
      onSuccess({ coords: { longitude: 139.7, latitude: 35.6 } } as GeolocationPosition),
    );
    const { store, result } = setup();
    act(() => result.current.locate());
    expect(store.getSnapshot().focus).toMatchObject({
      kind: FocusKind.POSITION,
      position: [139.7, 35.6],
      zoom: 16,
    });
    expect(store.getSnapshot().collection.features).toHaveLength(0);
    expect(result.current.locating).toBe(false);
  });

  test("marks the location with a dot, moved on the next locate", () => {
    let coords = { longitude: 139.7, latitude: 35.6 };
    mockGeolocation(onSuccess => onSuccess({ coords } as GeolocationPosition));
    const locationSource = new VectorSource();
    // Only the location layer is used here.
    const handles = { locationSource } as unknown as MapHandles;
    const store = createGeoStore({ type: "FeatureCollection", features: [] });
    const { result } = renderHook(() => useMyLocation(handles, store));
    const dot = () =>
      locationSource
        .getFeatures()
        .map(feature => toLonLat((feature.getGeometry() as Point).getCoordinates()));

    act(() => result.current.locate());
    expect(dot()).toHaveLength(1);
    expect(dot()[0][0]).toBeCloseTo(139.7);

    coords = { longitude: 135.5, latitude: 34.7 };
    act(() => result.current.locate());
    expect(dot()).toHaveLength(1);
    expect(dot()[0][0]).toBeCloseTo(135.5);
  });

  test("is locating until the browser answers", () => {
    mockGeolocation(vi.fn());
    const { result } = setup();
    act(() => result.current.locate());
    expect(result.current.locating).toBe(true);
  });

  test("explains a blocked permission", () => {
    const error = vi.spyOn(Notification, "error").mockImplementation(() => undefined);
    mockGeolocation(failWith(PERMISSION_DENIED));
    const { result } = setup();
    act(() => result.current.locate());
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Location access is blocked. Allow it in your browser settings to use this.",
      }),
    );
    expect(result.current.locating).toBe(false);
  });

  test("reports any other failure", () => {
    const error = vi.spyOn(Notification, "error").mockImplementation(() => undefined);
    mockGeolocation(failWith(POSITION_UNAVAILABLE));
    const { result } = setup();
    act(() => result.current.locate());
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Couldn't get your location. Please try again." }),
    );
  });

  test("is unsupported without browser geolocation", () => {
    Reflect.deleteProperty(navigator, "geolocation");
    const { result } = setup();
    expect(result.current.supported).toBe(false);
  });
});

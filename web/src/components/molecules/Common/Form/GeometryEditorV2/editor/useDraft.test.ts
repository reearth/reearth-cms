import { renderHook } from "@testing-library/react";
import type { FeatureCollection } from "geojson";
import type { RefObject } from "react";
import { describe, expect, test, vi } from "vitest";

import { createGeoStore } from "../core/geoStore";
import { EditOrigin } from "../core/types";
import type { GeoJsonPanelHandle } from "../panels/GeoJsonPanel";

import { useDraft } from "./useDraft";

const INITIAL: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", id: "s1", geometry: { type: "Point", coordinates: [1, 1] }, properties: {} },
  ],
};

const setup = ({ flush = true, readOnly = false } = {}) => {
  const store = createGeoStore(INITIAL);
  const jsonPanelRef: RefObject<GeoJsonPanelHandle> = { current: { flush: () => flush } };
  const onApply = vi.fn();
  const onClose = vi.fn();
  const confirm = vi.fn();
  const { result } = renderHook(() =>
    useDraft({
      store,
      initialCollection: INITIAL,
      originals: new Map([["s1", '{"type":"Point","coordinates":[1,1]}']]),
      multiple: false,
      readOnly,
      jsonPanelRef,
      confirm,
      onApply,
      onClose,
    }),
  );
  return { store, result, onApply, onClose, confirm };
};

describe("useDraft", () => {
  test("Apply without changes just closes", () => {
    const { result, onApply, onClose } = setup();
    result.current.apply();
    expect(onApply).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test("Apply writes the edited value, then closes", () => {
    const { store, result, onApply, onClose } = setup();
    store.setGeometry("s1", { type: "Point", coordinates: [2, 2] }, EditOrigin.MAP);
    result.current.apply();
    expect(onApply).toHaveBeenCalledWith('{"type":"Point","coordinates":[2,2]}');
    expect(onClose).toHaveBeenCalled();
  });

  test("Apply stops while the GeoJSON text is invalid", () => {
    const { result, onApply, onClose } = setup({ flush: false });
    result.current.apply();
    expect(onApply).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("Cancel asks before discarding changes", () => {
    const { store, result, onClose, confirm } = setup();
    store.setGeometry("s1", { type: "Point", coordinates: [2, 2] }, EditOrigin.MAP);
    result.current.requestClose();
    expect(confirm).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("Cancel closes at once with no changes, or when read-only", () => {
    const plain = setup();
    plain.result.current.requestClose();
    expect(plain.onClose).toHaveBeenCalled();

    const readOnly = setup({ readOnly: true, flush: false });
    readOnly.result.current.requestClose();
    expect(readOnly.onClose).toHaveBeenCalled();
    expect(plain.confirm).not.toHaveBeenCalled();
    expect(readOnly.confirm).not.toHaveBeenCalled();
  });
});

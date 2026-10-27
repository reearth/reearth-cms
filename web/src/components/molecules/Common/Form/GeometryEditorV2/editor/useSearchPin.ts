import type { Point } from "geojson";
import { useCallback, useState } from "react";

import type { GeoStore } from "../core/geoStore";
import { EditOrigin, FocusKind } from "../core/types";
import type { SearchPin } from "../map/EditorMap";
import type { GeocodeResult } from "../search/providers";

type Options = {
  store: GeoStore;
  multiple: boolean;
  confirmReplace: (proceed: () => void) => void;
  notifyReplaced: () => void;
};

type SearchPinState = {
  readonly searchPin: SearchPin | null;
  /** Previews a result: pins it and moves the map there, without changing the value. */
  readonly flyTo: (result: GeocodeResult) => void;
  /** Adds the result as a point, or replaces the single value with it. */
  readonly add: (result: GeocodeResult) => void;
  readonly clear: () => void;
};

export function useSearchPin({
  store,
  multiple,
  confirmReplace,
  notifyReplaced,
}: Options): SearchPinState {
  const [searchPin, setSearchPin] = useState<SearchPin | null>(null);

  const flyTo = useCallback(
    (result: GeocodeResult) => {
      setSearchPin({ id: result.id, label: result.label, position: result.position });
      if (result.bbox) store.focus({ kind: FocusKind.EXTENT, extent: result.bbox });
      else store.focus({ kind: FocusKind.POSITION, position: result.position, zoom: 16 });
    },
    [store],
  );

  const add = useCallback(
    (result: GeocodeResult) => {
      const geometry: Point = { type: "Point", coordinates: result.position };
      confirmReplace(() => {
        if (multiple) {
          store.addFeature(geometry, EditOrigin.SEARCH);
        } else {
          const replacing = store.getSnapshot().collection.features.length > 0;
          store.replaceAll(geometry, EditOrigin.SEARCH);
          if (replacing) notifyReplaced();
        }
        store.focus({ kind: FocusKind.POSITION, position: result.position, zoom: 16 });
        setSearchPin(null);
      });
    },
    [confirmReplace, multiple, notifyReplaced, store],
  );

  const clear = useCallback(() => setSearchPin(null), []);

  return { searchPin, flyTo, add, clear };
}

import type { Position } from "geojson";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { useCallback, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { useT } from "@reearth-cms/i18n";

import type { GeoStore } from "../core/geoStore";
import { FocusKind } from "../core/types";

import type { MapHandles } from "./useOlMap";

const LOCATE_ZOOM = 16;
const LOCATE_OPTIONS: PositionOptions = {
  // Street level is enough to start from, and a coarse fix answers much faster.
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};

type MyLocation = {
  /** False when the browser has no geolocation, so the button can be hidden. */
  readonly supported: boolean;
  readonly locating: boolean;
  /** Moves the map to the user's location. It never adds or changes a shape. */
  readonly locate: () => void;
};

export function useMyLocation(handles: MapHandles | null, store: GeoStore): MyLocation {
  const t = useT();
  const [locating, setLocating] = useState<boolean>(false);
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;

  const locate = useCallback(() => {
    if (!supported) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const position: Position = [coords.longitude, coords.latitude];
        store.focus({ kind: FocusKind.POSITION, position, zoom: LOCATE_ZOOM });
        // Stays until the editor closes; locating again moves it.
        handles?.locationSource.clear();
        handles?.locationSource.addFeature(new Feature(new Point(fromLonLat(position))));
      },
      error => {
        setLocating(false);
        Notification.error({
          message:
            error.code === error.PERMISSION_DENIED
              ? t("Location access is blocked. Allow it in your browser settings to use this.")
              : t("Couldn't get your location. Please try again."),
          placement: "bottomLeft",
        });
      },
      LOCATE_OPTIONS,
    );
  }, [handles, store, supported, t]);

  return { supported, locating, locate };
}

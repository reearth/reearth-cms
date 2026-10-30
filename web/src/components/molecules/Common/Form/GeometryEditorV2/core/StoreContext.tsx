import { createContext, useContext, useSyncExternalStore } from "react";

import type { GeoStore } from "./geoStore";
import type { GeoSnapshot } from "./types";

const GeoStoreContext = createContext<GeoStore | null>(null);

export const GeoStoreProvider = GeoStoreContext.Provider;

export function useGeoStore(): GeoStore {
  const store = useContext(GeoStoreContext);
  if (!store) throw new Error("useGeoStore must be used inside a GeoStoreProvider");
  return store;
}

export function useGeoSnapshot(): GeoSnapshot {
  const store = useGeoStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

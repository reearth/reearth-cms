import type { Position } from "geojson";

import { t } from "@reearth-cms/i18n";

export enum GeocoderId {
  GSI = "GSI",
  NOMINATIM = "NOMINATIM",
}

export type GeocodeResult = {
  readonly id: string;
  readonly label: string;
  readonly detail: string | null;
  /** What the provider thinks this place is, in plain words ("station", "park"). */
  readonly kind: string | null;
  /** [longitude, latitude] */
  readonly position: Position;
  /** [west, south, east, north] when the provider knows the place's extent. */
  readonly bbox?: readonly [number, number, number, number];
};

export type GeocodeProvider = {
  readonly id: GeocoderId;
  readonly label: () => string;
  readonly attribution: string;
  search(query: string, lang: string, signal: AbortSignal): Promise<GeocodeResult[]>;
};

const MAX_RESULTS = 8;

type NominatimEntry = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  type?: string;
  boundingbox?: [string, string, string, string];
};

/**
 * Public Nominatim: 1 req/s, no autocomplete, not for production (see the PoC's
 * comparison). Searches therefore run on Enter only.
 */
const nominatim: GeocodeProvider = {
  id: GeocoderId.NOMINATIM,
  label: () => t("Places (OSM)"),
  attribution: "© OpenStreetMap contributors",
  async search(query, lang, signal) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", String(MAX_RESULTS));
    url.searchParams.set("accept-language", lang);
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const entries = (await response.json()) as NominatimEntry[];
    return entries.map(entry => {
      const [south, north, west, east] = (entry.boundingbox ?? []).map(Number);
      const name = entry.name?.trim();
      return {
        id: String(entry.place_id),
        label: name || entry.display_name.split(",")[0],
        detail: entry.display_name,
        kind: entry.type && entry.type !== "yes" ? entry.type.replace(/_/g, " ") : null,
        position: [Number(entry.lon), Number(entry.lat)],
        bbox: Number.isFinite(west) ? [west, south, east, north] : undefined,
      };
    });
  },
};

type GsiEntry = {
  geometry: { coordinates: Position };
  properties: { title: string };
};

/** 国土地理院 address search: precise on 住所, poor on landmark names. */
const gsi: GeocodeProvider = {
  id: GeocoderId.GSI,
  label: () => t("JP addresses (GSI)"),
  attribution: "国土地理院",
  async search(query, _lang, signal) {
    const url = new URL("https://msearch.gsi.go.jp/address-search/AddressSearch");
    url.searchParams.set("q", query);
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const entries = (await response.json()) as GsiEntry[];
    return entries.slice(0, MAX_RESULTS).map((entry, index) => ({
      id: `${entry.properties.title}-${index}`,
      label: entry.properties.title,
      detail: null,
      kind: t("address"),
      position: entry.geometry.coordinates,
    }));
  },
};

export const PROVIDERS: Record<GeocoderId, GeocodeProvider> = {
  [GeocoderId.GSI]: gsi,
  [GeocoderId.NOMINATIM]: nominatim,
};

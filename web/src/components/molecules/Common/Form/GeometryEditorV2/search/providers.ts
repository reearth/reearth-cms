import type { Position } from "geojson";

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
 * Public Nominatim: 1 req/s, no autocomplete, not for production. Searches therefore run
 * on Enter only.
 */
export const NOMINATIM: GeocodeProvider = {
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

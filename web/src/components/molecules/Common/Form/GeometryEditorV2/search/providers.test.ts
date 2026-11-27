import { afterEach, describe, expect, test, vi } from "vitest";

import { NOMINATIM } from "./providers";

type NominatimEntry = Record<string, unknown>;

const TOKYO_STATION: NominatimEntry = {
  place_id: 1,
  lat: "35.68",
  lon: "139.76",
  name: "Tokyo Station",
  display_name: "Tokyo Station, Marunouchi, Chiyoda, Tokyo",
  type: "train_station",
  // Nominatim orders it [south, north, west, east].
  boundingbox: ["35.67", "35.69", "139.75", "139.77"],
};

const respondWith = (body: NominatimEntry[], ok = true, status = 200) => {
  const fetch = vi.fn().mockResolvedValue({ ok, status, json: async () => body });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

const search = (query = "tokyo", lang = "ja") =>
  NOMINATIM.search(query, lang, new AbortController().signal);

describe("NOMINATIM", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("maps an entry to a result, with the bbox as [west, south, east, north]", async () => {
    respondWith([TOKYO_STATION]);
    expect(await search()).toEqual([
      {
        id: "1",
        label: "Tokyo Station",
        detail: "Tokyo Station, Marunouchi, Chiyoda, Tokyo",
        kind: "train station",
        position: [139.76, 35.68],
        bbox: [139.75, 35.67, 139.77, 35.69],
      },
    ]);
  });

  test("falls back to the first part of the address when there is no name", async () => {
    respondWith([{ ...TOKYO_STATION, name: "  " }]);
    expect((await search())[0].label).toBe("Tokyo Station");
  });

  test('drops the meaningless type "yes"', async () => {
    respondWith([{ ...TOKYO_STATION, type: "yes" }]);
    expect((await search())[0].kind).toBeNull();
  });

  test("leaves the bbox out when Nominatim has none", async () => {
    respondWith([{ ...TOKYO_STATION, boundingbox: undefined }]);
    expect((await search())[0].bbox).toBeUndefined();
  });

  test("asks in the user's language, for a few results, and passes the abort signal", async () => {
    const fetch = respondWith([]);
    const signal = new AbortController().signal;
    await NOMINATIM.search("tokyo station", "en", signal);
    const [url, init] = fetch.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get("q")).toBe("tokyo station");
    expect(url.searchParams.get("accept-language")).toBe("en");
    expect(url.searchParams.get("limit")).toBe("8");
    expect(init.signal).toBe(signal);
  });

  test("rejects on an HTTP error", async () => {
    respondWith([], false, 503);
    await expect(search()).rejects.toThrow("HTTP 503");
  });
});

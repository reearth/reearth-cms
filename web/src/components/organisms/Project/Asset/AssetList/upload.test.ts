import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { CreateAssetUploadPayload } from "./upload";
import { uploadFiles } from "./upload";

const link = (overrides: Partial<CreateAssetUploadPayload> = {}): CreateAssetUploadPayload => ({
  url: "https://storage/put",
  token: "token-1",
  contentType: "application/json",
  contentLength: 0,
  contentEncoding: "",
  next: "",
  ...overrides,
});

describe("uploadFiles", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    if (!("CompressionStream" in window)) {
      vi.stubGlobal("CompressionStream", vi.fn());
      Object.assign(window, { CompressionStream: globalThis.CompressionStream });
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("gzips when the storage asks for gzip, even for a small file", async () => {
    const pipeThrough = vi.fn(() => new ReadableStream());
    const file = new File(["{}"], "small.json");
    // jsdom's File has no stream(); gzipStreamFromBlob only needs pipeThrough.
    Object.defineProperty(file, "stream", { value: () => ({ pipeThrough }) });

    const createAsset = vi.fn(async (token: string) => token);
    const res = await uploadFiles(
      [file],
      async () => link({ contentEncoding: "gzip" }),
      createAsset,
    );

    expect(res).toEqual(["token-1"]);
    expect(pipeThrough).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0][1] as RequestInit & { duplex?: string };
    expect(init.body).toBeInstanceOf(ReadableStream);
    expect(init.duplex).toBe("half");
    expect(init.headers).toEqual({ "Content-Type": "application/json", "Content-Encoding": "gzip" });
  });

  test("sends raw bytes when the storage does not ask for gzip, even for a large text file", async () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024)], "large.json");
    const requested: (string | undefined)[] = [];

    await uploadFiles(
      [file],
      async ({ contentEncoding }) => {
        requested.push(contentEncoding);
        return link();
      },
      async token => token,
    );

    // The client still offers gzip for large text files ...
    expect(requested).toEqual(["gzip"]);
    // ... but follows the storage's answer.
    const init = fetchMock.mock.calls[0][1] as RequestInit & { duplex?: string };
    expect(init.body).toBe(file);
    expect(init.duplex).toBeUndefined();
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });
});

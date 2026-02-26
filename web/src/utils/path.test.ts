import { describe, test, expect } from "vitest";

import { splitPathname, joinPaths } from "./path";

describe("path", () => {
  test("splitPathname function correctly splits pathname into primary, secondary, and sub routes", () => {
    const pathname1 = "localhost:3000/workspace/xxx";
    const pathname2 = "localhost:3000/workspace/xxx/project/yyy";
    const pathname3 = "localhost:3000/workspace/xxx/project/yyy/content/zzz";

    expect(splitPathname(pathname1)).toEqual(["workspace", undefined, undefined]);
    expect(splitPathname(pathname2)).toEqual(["workspace", "project", undefined]);
    expect(splitPathname(pathname3)).toEqual(["workspace", "project", "content"]);
  });

  test("joinPaths with URLs", () => {
    expect(joinPaths("http://localhost:3000", "workspace/xxx")).toEqual(
      "http://localhost:3000/workspace/xxx",
    );
    expect(joinPaths("https://example.com/", "/api/v1/", "users")).toEqual(
      "https://example.com/api/v1/users",
    );
    expect(joinPaths("ftp://server.com", "files", "/2025/")).toEqual("ftp://server.com/files/2025");
    expect(joinPaths("https://example.com/", "/search", "?q=test#top")).toEqual(
      "https://example.com/search?q=test#top",
    );
    expect(joinPaths("example.com/", "/search", "?q=test#top")).toEqual(
      "example.com/search?q=test#top",
    );
  });
});

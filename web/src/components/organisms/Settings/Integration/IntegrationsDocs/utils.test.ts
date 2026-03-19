import { describe, expect, test } from "vitest";

import { OpenApiSpecTransformer } from "./utils";

const baseSpec = {
  openapi: "3.0.3",
  info: { title: "Test API", version: "1.0.0" },
  paths: {
    "/{workspaceIdOrAlias}/projects": {
      get: { summary: "List projects" },
      parameters: [{ $ref: "#/components/parameters/workspaceIdOrAliasParam" }],
    },
    "/{workspaceIdOrAlias}/projects/{projectId}": {
      get: { summary: "Get project" },
      parameters: [
        { $ref: "#/components/parameters/workspaceIdOrAliasParam" },
        { name: "projectId", in: "path", required: true, schema: { type: "string" } },
      ],
    },
  },
  components: {
    parameters: {
      workspaceIdOrAliasParam: {
        name: "workspaceIdOrAlias",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    },
  },
};

describe("OpenApiSpecTransformer", () => {
  describe("transformSpec", () => {
    test("should set server URL with workspace variable", () => {
      const result = OpenApiSpecTransformer.transformSpec(
        baseSpec,
        "my-workspace",
        "http://api.example.com",
      );

      const servers = result?.servers as Record<string, unknown>[];
      expect(servers).toHaveLength(1);
      expect(servers[0].url).toBe("http://api.example.com/{workspaceIdOrAlias}");

      const variables = servers[0].variables as Record<string, Record<string, string>>;
      expect(variables.workspaceIdOrAlias.default).toBe("my-workspace");
    });

    test("should strip /{workspaceIdOrAlias} prefix from paths", () => {
      const result = OpenApiSpecTransformer.transformSpec(
        baseSpec,
        "ws-1",
        "http://api.example.com",
      );

      const paths = result?.paths as Record<string, unknown>;
      expect(paths).toHaveProperty("/projects");
      expect(paths).toHaveProperty("/projects/{projectId}");
      expect(paths).not.toHaveProperty("/{workspaceIdOrAlias}/projects");
      expect(paths).not.toHaveProperty("/{workspaceIdOrAlias}/projects/{projectId}");
    });

    test("should deep copy path values", () => {
      const result = OpenApiSpecTransformer.transformSpec(
        baseSpec,
        "ws-1",
        "http://api.example.com",
      );

      const resultPaths = result?.paths as Record<string, Record<string, unknown>>;
      const originalPaths = baseSpec.paths as Record<string, Record<string, unknown>>;
      expect(resultPaths["/projects"].get).toEqual(
        originalPaths["/{workspaceIdOrAlias}/projects"].get,
      );
      expect(resultPaths["/projects"].get).not.toBe(
        originalPaths["/{workspaceIdOrAlias}/projects"].get,
      );
    });

    test("should preserve other spec properties", () => {
      const result = OpenApiSpecTransformer.transformSpec(
        baseSpec,
        "ws-1",
        "http://api.example.com",
      );

      expect(result?.openapi).toBe("3.0.3");
      expect(result?.info).toEqual({ title: "Test API", version: "1.0.0" });
      expect(result?.components).toBeDefined();
    });

    test("should return raw input when parsing fails", () => {
      const result = OpenApiSpecTransformer.transformSpec(
        "not an object",
        "ws-1",
        "http://api.example.com",
      );
      expect(result).toBe("not an object");
    });

    test("should handle spec with no paths", () => {
      const spec = { openapi: "3.0.3", info: { title: "Test", version: "1.0.0" } };
      const result = OpenApiSpecTransformer.transformSpec(spec, "ws-1", "http://api.example.com");

      expect(result?.paths).toBeUndefined();
    });

    test("should handle root path after prefix removal", () => {
      const spec = {
        paths: {
          "/{workspaceIdOrAlias}": { get: { summary: "Root" } },
        },
      };
      const result = OpenApiSpecTransformer.transformSpec(spec, "ws-1", "http://api.example.com");

      const paths = result?.paths as Record<string, unknown>;
      expect(paths).toHaveProperty("/");
    });
  });
});

/* eslint-disable @typescript-eslint/no-extraneous-class */
import { z } from "zod";

export type OpenApiSpec = Record<string, unknown>;

export abstract class OpenApiSpecTransformer {
  private static readonly WORKSPACE_PARAM = "workspaceIdOrAlias";
  private static readonly openApiSpecSchema = z.record(z.string(), z.unknown());

  public static transformSpec(
    raw: unknown,
    workspaceId: string,
    apiUrl: string,
  ): OpenApiSpec | undefined {
    const parsed = this.openApiSpecSchema.safeParse(raw);
    if (!parsed.success) return raw as OpenApiSpec;

    const spec: OpenApiSpec = {
      ...parsed.data,
      servers: [
        {
          url: `${apiUrl}/{${this.WORKSPACE_PARAM}}`,
          variables: {
            [this.WORKSPACE_PARAM]: {
              default: workspaceId,
              description: "Workspace ID or alias",
            },
          },
        },
      ],
    };

    return { ...spec, paths: this.rewritePaths(spec.paths) };
  }

  private static rewritePaths(paths: unknown): Record<string, unknown> | undefined {
    if (!paths || typeof paths !== "object") return undefined;
    const original = paths as Record<string, unknown>;
    const rewritten: Record<string, unknown> = {};
    const prefix = new RegExp(`^/\\{${this.WORKSPACE_PARAM}\\}`);

    for (const key of Object.keys(original)) {
      const newKey = key.replace(prefix, "") || "/";
      rewritten[newKey] = structuredClone(original[key]);
    }

    return rewritten;
  }
}

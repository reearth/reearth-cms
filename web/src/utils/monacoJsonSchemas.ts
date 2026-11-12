import { json } from "monaco-editor";

type JsonSchemaEntry = {
  uri: string;
  /** Model paths the schema applies to, e.g. `geometry-v2/*`. Never `*`. */
  fileMatch: string[];
  schema: unknown;
};

const registry = new Map<string, JsonSchemaEntry>();

/**
 * Monaco's JSON diagnostics options are global, so editors that each call
 * `setDiagnosticsOptions` overwrite one another. Registering through here keeps every
 * schema scoped to its own model paths.
 */
export function registerJsonSchema(entry: JsonSchemaEntry) {
  registry.set(entry.uri, entry);
  json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemaValidation: "error",
    enableSchemaRequest: false,
    schemas: [...registry.values()],
  });
}

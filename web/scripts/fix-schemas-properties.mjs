// Post-codegen patches for graphql.schemas.generated.ts to make it usable
// under zod 4 + typescript-operations' `nonOptionalTypename: true`.
//
// 1. `Properties<T>` helper — graphql-codegen-typescript-validation-schema@0.19.0
//    emits a zod-3-shaped form (`z.ZodType<T[K], T[K] | undefined>`) on the
//    `withOperationType` path even when `schema: "zodv4"` is set. Its own zodv4
//    example uses `Required<{ [K in keyof T]: z.ZodType<T[K]> }>`. Rewrite ours
//    to match so zod 4's inferred types unify.
//
// 2. `__typename` literals on object-type schemas — the plugin always emits
//    `.optional()`, but typescript-operations is configured with
//    `nonOptionalTypename: true` so the TS types have `__typename` as required.
//    Drop the `.optional()` so the schema unifies with the type.
//
// 3. Operation result schemas (`*QuerySchema`, `*MutationSchema`,
//    `*SubscriptionSchema`) — the plugin emits the schema body without the
//    selected `__typename` literals at all, so the inferred output type is
//    missing `__typename` everywhere TypeScript expects it (still due to
//    `nonOptionalTypename: true`). The annotation `: z.ZodType<XQuery>` then
//    fails. Strip the annotation: the schema still works at runtime and the
//    validationLink looks it up dynamically, so the lost compile-time tie
//    isn't load-bearing. The corresponding type imports become unused, which
//    is fine because tsconfig does not set `noUnusedLocals`.
//
// If a regex stops matching after a plugin upgrade, the corresponding step is
// a no-op; tsc will surface any remaining mismatch.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../src/gql/__generated__/graphql.schemas.generated.ts");

const brokenHelper =
  /type Properties<T> = \{\s*\[K in keyof T\]: z\.ZodType<T\[K\], T\[K\] \| undefined>;\s*\};/;
const fixedHelper =
  "type Properties<T> = Required<{ [K in keyof T]: z.ZodType<T[K]> }>;";

const optionalTypename = /(__typename: z\.literal\("[^"]+"\))\.optional\(\)/g;

const operationReturnAnnotation =
  /\(\): z\.ZodType<[A-Z][A-Za-z0-9_]*(?:Query|Mutation|Subscription)> \{/g;

const patched = readFileSync(target, "utf8")
  .replace(brokenHelper, fixedHelper)
  .replace(optionalTypename, "$1")
  .replace(operationReturnAnnotation, "() {");

writeFileSync(target, patched);

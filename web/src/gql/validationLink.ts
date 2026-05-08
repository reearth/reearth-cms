import { ApolloLink, Observable } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import type { ZodType } from "zod";

import * as Schemas from "./__generated__/graphql.schemas.generated";

type SchemaFactory = () => ZodType;

const isSchemaFactory = (v: unknown): v is SchemaFactory => typeof v === "function";

const getResponseSchema = (operation: ApolloLink.Operation): ZodType | undefined => {
  if (!operation.operationName) return;
  const def = getMainDefinition(operation.query);
  if (def.kind !== "OperationDefinition") return;
  const kind = def.operation;
  const key = `${operation.operationName}${kind[0].toUpperCase()}${kind.slice(1)}Schema`;
  const factory = (Schemas as Record<string, unknown>)[key];
  return isSchemaFactory(factory) ? factory() : undefined;
};

export const validationLink = new ApolloLink((operation, forward) => {
  const schema = getResponseSchema(operation);
  if (!schema) return forward(operation);

  return new Observable(observer => {
    const sub = forward(operation).subscribe({
      next: result => {
        if (result?.data) {
          const parsed = schema.safeParse(result.data);
          if (!parsed.success) {
            console.warn(
              `[gql-validate] response data failed validation for ${operation.operationName}`,
              parsed.error.message,
            );
          }
        }
        observer.next(result);
      },
      error: err => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => sub.unsubscribe();
  });
});

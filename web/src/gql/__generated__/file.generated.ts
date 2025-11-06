import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AssetFileFragmentFragment = {
  __typename: "AssetFile";
  name: string;
  path: string;
  filePaths: Array<string> | null;
};

export const AssetFileFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFileFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AssetFile" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "path" } },
          { kind: "Field", name: { kind: "Name", value: "filePaths" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssetFileFragmentFragment, unknown>;

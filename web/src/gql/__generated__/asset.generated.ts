import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AssetFragmentFragment = {
  __typename: "Asset";
  id: string;
  fileName: string;
  projectId: string;
  createdAt: Date;
  size: number;
  previewType: Types.PreviewType | null;
  uuid: string;
  url: string;
  archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
  public: boolean;
  createdBy:
    | {
        __typename: "Integration";
        id: string;
        name: string;
        description: string | null;
        logoUrl: string;
        iType: Types.IntegrationType;
        developerId: string;
        createdAt: Date;
        updatedAt: Date;
        developer: { __typename: "User"; id: string; name: string; email: string };
        config: {
          __typename: "IntegrationConfig";
          token: string;
          webhooks: Array<{
            __typename: "Webhook";
            id: string;
            name: string;
            url: string;
            active: boolean;
            secret: string;
            createdAt: Date;
            updatedAt: Date;
            trigger: {
              __typename: "WebhookTrigger";
              onItemCreate: boolean | null;
              onItemUpdate: boolean | null;
              onItemDelete: boolean | null;
              onItemPublish: boolean | null;
              onItemUnPublish: boolean | null;
              onAssetUpload: boolean | null;
              onAssetDecompress: boolean | null;
              onAssetDelete: boolean | null;
            };
          }>;
        } | null;
      }
    | { __typename: "User"; id: string; name: string; email: string };
  thread: {
    __typename: "Thread";
    id: string;
    workspaceId: string;
    comments: Array<{
      __typename: "Comment";
      id: string;
      authorId: string;
      content: string;
      createdAt: Date;
      author:
        | { __typename: "Integration"; id: string; name: string }
        | { __typename: "User"; id: string; name: string; email: string }
        | null;
    }>;
  } | null;
};

export const AssetFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "integrationFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "integrationFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Integration" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "logoUrl" } },
          { kind: "Field", name: { kind: "Name", value: "iType" } },
          { kind: "Field", name: { kind: "Name", value: "developerId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "developer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "config" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "token" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "webhooks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      { kind: "Field", name: { kind: "Name", value: "secret" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "trigger" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "onItemCreate" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemUpdate" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemDelete" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemPublish" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemUnPublish" } },
                            { kind: "Field", name: { kind: "Name", value: "onAssetUpload" } },
                            { kind: "Field", name: { kind: "Name", value: "onAssetDecompress" } },
                            { kind: "Field", name: { kind: "Name", value: "onAssetDelete" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssetFragmentFragment, unknown>;

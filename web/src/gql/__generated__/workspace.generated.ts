import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type WorkspaceFragmentFragment = {
  __typename: "Workspace";
  id: string;
  name: string;
  alias: string | null;
  personal: boolean;
  members: Array<
    | {
        __typename: "WorkspaceIntegrationMember";
        integrationId: string;
        role: Types.Role;
        active: boolean;
        invitedById: string;
        integration: {
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
        } | null;
        invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
      }
    | {
        __typename: "WorkspaceUserMember";
        userId: string;
        role: Types.Role;
        user: { __typename: "User"; id: string; name: string; email: string } | null;
      }
  >;
};

export type GetWorkspacesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetWorkspacesQuery = {
  me: {
    __typename: "Me";
    id: string;
    name: string;
    myWorkspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    } | null;
    workspaces: Array<{
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    }>;
  } | null;
};

export type GetWorkspaceQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type GetWorkspaceQuery = {
  node:
    | { __typename: "Asset" }
    | { __typename: "Group" }
    | { __typename: "Integration" }
    | { __typename: "Item" }
    | { __typename: "Model" }
    | { __typename: "Project" }
    | { __typename: "Request" }
    | { __typename: "Schema" }
    | { __typename: "User" }
    | { __typename: "View" }
    | {
        __typename: "Workspace";
        id: string;
        name: string;
        alias: string | null;
        personal: boolean;
        members: Array<
          | {
              __typename: "WorkspaceIntegrationMember";
              integrationId: string;
              role: Types.Role;
              active: boolean;
              invitedById: string;
              integration: {
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
              } | null;
              invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
            }
          | {
              __typename: "WorkspaceUserMember";
              userId: string;
              role: Types.Role;
              user: { __typename: "User"; id: string; name: string; email: string } | null;
            }
        >;
      }
    | { __typename: "WorkspaceSettings" }
    | null;
};

export type UpdateWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
}>;

export type UpdateWorkspaceMutation = {
  updateWorkspace: {
    __typename: "UpdateWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type DeleteWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
}>;

export type DeleteWorkspaceMutation = {
  deleteWorkspace: { __typename: "DeleteWorkspacePayload"; workspaceId: string } | null;
};

export type AddUsersToWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  users: Array<Types.MemberInput> | Types.MemberInput;
}>;

export type AddUsersToWorkspaceMutation = {
  addUsersToWorkspace: {
    __typename: "AddUsersToWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type UpdateMemberOfWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  userId: Types.Scalars["ID"]["input"];
  role: Types.Role;
}>;

export type UpdateMemberOfWorkspaceMutation = {
  updateUserOfWorkspace: {
    __typename: "UpdateMemberOfWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type RemoveMultipleMembersFromWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  userIds: Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"];
}>;

export type RemoveMultipleMembersFromWorkspaceMutation = {
  removeMultipleMembersFromWorkspace: {
    __typename: "RemoveMultipleMembersFromWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type AddIntegrationToWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  integrationId: Types.Scalars["ID"]["input"];
  role: Types.Role;
}>;

export type AddIntegrationToWorkspaceMutation = {
  addIntegrationToWorkspace: {
    __typename: "AddUsersToWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type UpdateIntegrationOfWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  integrationId: Types.Scalars["ID"]["input"];
  role: Types.Role;
}>;

export type UpdateIntegrationOfWorkspaceMutation = {
  updateIntegrationOfWorkspace: {
    __typename: "UpdateMemberOfWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type RemoveIntegrationFromWorkspaceMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  integrationId: Types.Scalars["ID"]["input"];
}>;

export type RemoveIntegrationFromWorkspaceMutation = {
  removeIntegrationFromWorkspace: {
    __typename: "RemoveIntegrationFromWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type CreateWorkspaceMutationVariables = Types.Exact<{
  name: Types.Scalars["String"]["input"];
}>;

export type CreateWorkspaceMutation = {
  createWorkspace: {
    __typename: "CreateWorkspacePayload";
    workspace: {
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      personal: boolean;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
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
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    };
  } | null;
};

export type GetWorkspaceSettingsQueryVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
}>;

export type GetWorkspaceSettingsQuery = {
  node:
    | { __typename: "Asset"; id: string }
    | { __typename: "Group"; id: string }
    | { __typename: "Integration"; id: string }
    | { __typename: "Item"; id: string }
    | { __typename: "Model"; id: string }
    | { __typename: "Project"; id: string }
    | { __typename: "Request"; id: string }
    | { __typename: "Schema"; id: string }
    | { __typename: "User"; id: string }
    | { __typename: "View"; id: string }
    | { __typename: "Workspace"; id: string }
    | {
        __typename: "WorkspaceSettings";
        id: string;
        tiles: {
          __typename: "ResourceList";
          enabled: boolean | null;
          selectedResource: string | null;
          resources: Array<
            | { __typename: "TerrainResource" }
            | {
                __typename: "TileResource";
                id: string;
                type: Types.TileType;
                props: {
                  __typename: "UrlResourceProps";
                  name: string;
                  url: string;
                  image: string;
                } | null;
              }
          >;
        } | null;
        terrains: {
          __typename: "ResourceList";
          enabled: boolean | null;
          selectedResource: string | null;
          resources: Array<
            | {
                __typename: "TerrainResource";
                id: string;
                type: Types.TerrainType;
                props: {
                  __typename: "CesiumResourceProps";
                  name: string;
                  url: string;
                  image: string;
                  cesiumIonAssetId: string;
                  cesiumIonAccessToken: string;
                } | null;
              }
            | { __typename: "TileResource" }
          >;
        } | null;
      }
    | null;
};

export type UpdateWorkspaceSettingsMutationVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
  tiles?: Types.InputMaybe<Types.ResourcesListInput>;
  terrains?: Types.InputMaybe<Types.ResourcesListInput>;
}>;

export type UpdateWorkspaceSettingsMutation = {
  updateWorkspaceSettings: {
    __typename: "UpdateWorkspaceSettingsPayload";
    workspaceSettings: {
      __typename: "WorkspaceSettings";
      id: string;
      tiles: {
        __typename: "ResourceList";
        enabled: boolean | null;
        selectedResource: string | null;
        resources: Array<
          | { __typename: "TerrainResource" }
          | {
              __typename: "TileResource";
              id: string;
              type: Types.TileType;
              props: {
                __typename: "UrlResourceProps";
                name: string;
                url: string;
                image: string;
              } | null;
            }
        >;
      } | null;
      terrains: {
        __typename: "ResourceList";
        enabled: boolean | null;
        selectedResource: string | null;
        resources: Array<
          | {
              __typename: "TerrainResource";
              id: string;
              type: Types.TerrainType;
              props: {
                __typename: "CesiumResourceProps";
                name: string;
                url: string;
                image: string;
                cesiumIonAssetId: string;
                cesiumIonAccessToken: string;
              } | null;
            }
          | { __typename: "TileResource" }
        >;
      } | null;
    };
  } | null;
};

export const GetWorkspacesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetWorkspaces" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "myWorkspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspaces" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetWorkspacesQuery, GetWorkspacesQueryVariables>;
export const GetWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "node" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "WORKSPACE" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetWorkspaceQuery, GetWorkspaceQueryVariables>;
export const UpdateWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export const DeleteWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "workspaceId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;
export const AddUsersToWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddUsersToWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "users" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "MemberInput" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addUsersToWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "users" },
                      value: { kind: "Variable", name: { kind: "Name", value: "users" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddUsersToWorkspaceMutation, AddUsersToWorkspaceMutationVariables>;
export const UpdateMemberOfWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateMemberOfWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Role" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateUserOfWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "userId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "role" },
                      value: { kind: "Variable", name: { kind: "Name", value: "role" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateMemberOfWorkspaceMutation,
  UpdateMemberOfWorkspaceMutationVariables
>;
export const RemoveMultipleMembersFromWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveMultipleMembersFromWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeMultipleMembersFromWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "userIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "userIds" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveMultipleMembersFromWorkspaceMutation,
  RemoveMultipleMembersFromWorkspaceMutationVariables
>;
export const AddIntegrationToWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddIntegrationToWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Role" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addIntegrationToWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integrationId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "role" },
                      value: { kind: "Variable", name: { kind: "Name", value: "role" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddIntegrationToWorkspaceMutation,
  AddIntegrationToWorkspaceMutationVariables
>;
export const UpdateIntegrationOfWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateIntegrationOfWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "role" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Role" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateIntegrationOfWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integrationId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "role" },
                      value: { kind: "Variable", name: { kind: "Name", value: "role" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateIntegrationOfWorkspaceMutation,
  UpdateIntegrationOfWorkspaceMutationVariables
>;
export const RemoveIntegrationFromWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RemoveIntegrationFromWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "removeIntegrationFromWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integrationId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveIntegrationFromWorkspaceMutation,
  RemoveIntegrationFromWorkspaceMutationVariables
>;
export const CreateWorkspaceDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateWorkspace" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createWorkspace" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "WorkspaceFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
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
      name: { kind: "Name", value: "WorkspaceFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Workspace" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "alias" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "members" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceUserMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                    ],
                  },
                },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "integration" },
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
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "invitedBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "personal" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;
export const GetWorkspaceSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetWorkspaceSettings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "node" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "WorkspaceSettings" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "WorkspaceSettings" },
                  },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "tiles" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "resources" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "TileResource" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "props" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "url" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "image" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "enabled" } },
                            { kind: "Field", name: { kind: "Name", value: "selectedResource" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "terrains" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "resources" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "TerrainResource" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "props" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "url" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "image" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "cesiumIonAssetId" },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "cesiumIonAccessToken",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "enabled" } },
                            { kind: "Field", name: { kind: "Name", value: "selectedResource" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetWorkspaceSettingsQuery, GetWorkspaceSettingsQueryVariables>;
export const UpdateWorkspaceSettingsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateWorkspaceSettings" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "tiles" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ResourcesListInput" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "terrains" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ResourcesListInput" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWorkspaceSettings" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "id" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "tiles" },
                      value: { kind: "Variable", name: { kind: "Name", value: "tiles" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "terrains" },
                      value: { kind: "Variable", name: { kind: "Name", value: "terrains" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspaceSettings" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "tiles" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "resources" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "TileResource" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "props" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "url" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "image" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "enabled" } },
                            { kind: "Field", name: { kind: "Name", value: "selectedResource" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "terrains" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "resources" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "TerrainResource" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "props" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "url" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "image" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "cesiumIonAssetId" },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "cesiumIonAccessToken",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "enabled" } },
                            { kind: "Field", name: { kind: "Name", value: "selectedResource" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateWorkspaceSettingsMutation,
  UpdateWorkspaceSettingsMutationVariables
>;

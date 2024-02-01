import { Member, Workspace } from "@reearth-cms/components/molecules/Workspace/types";
import {
  Workspace as GQLWorkspace,
  WorkspaceMember,
  WorkspaceUserMember,
} from "@reearth-cms/gql/graphql-client-api";

export const convertWorkspace = (workspace?: GQLWorkspace): Workspace | undefined => {
  if (!workspace) return;
  return {
    id: workspace?.id,
    name: workspace?.name,
    personal: workspace?.personal,
    members: workspace?.members?.map(member => convertMember(member)),
  };
};

export const convertMember = (member: WorkspaceMember): Member => {
  return {
    userId: (member as WorkspaceUserMember).userId,
    role: member.role,
    user: {
      id: (member as WorkspaceUserMember).user?.id ?? "",
      name: (member as WorkspaceUserMember).user?.name ?? "",
      email: (member as WorkspaceUserMember).user?.email ?? "",
    },
  };
};

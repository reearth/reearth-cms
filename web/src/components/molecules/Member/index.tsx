import { useCallback, useState } from "react";

import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import MemberTable from "@reearth-cms/components/molecules/Member/MemberTable";
import { User, Role } from "@reearth-cms/components/molecules/Member/types";
import { UserMember, MemberInput } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  workspaceUserMembers?: UserMember[];
  userId?: string;
  isAbleToLeave: boolean;
  onMemberRemoveFromWorkspace: (userIds: string[]) => Promise<void>;
  onLeave: (userId: string) => Promise<void>;
  onSearchTerm: (term?: string) => void;
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  loading: boolean;
  onReload: () => void;
  hasInviteRight: boolean;
  hasRemoveRight: boolean;
  hasChangeRoleRight: boolean;
  updateLoading: boolean;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
  searchLoading: boolean;
  addLoading: boolean;
  onUserSearch: (nameOrEmail: string) => Promise<User[]>;
  onUsersAddToWorkspace: (users: MemberInput[]) => Promise<void>;
};

const Member: React.FC<Props> = ({
  workspaceUserMembers,
  userId,
  isAbleToLeave,
  onMemberRemoveFromWorkspace,
  onLeave,
  onSearchTerm,
  page,
  pageSize,
  onTableChange,
  loading,
  onReload,
  hasInviteRight,
  hasRemoveRight,
  hasChangeRoleRight,
  updateLoading,
  onUpdateRole,
  searchLoading,
  addLoading,
  onUserSearch,
  onUsersAddToWorkspace,
}) => {
  const [selectedMember, setSelectedMember] = useState<UserMember>();
  const [isRoleModalShow, setIsRoleModalShow] = useState(false);
  const [isAddModalShow, setIsAddModalShown] = useState(false);

  const handleRoleModalClose = useCallback(() => {
    setIsRoleModalShow(false);
  }, []);

  const handleRoleModalOpen = useCallback((member: UserMember) => {
    setIsRoleModalShow(true);
    setSelectedMember(member);
  }, []);

  const handleMemberAddModalClose = useCallback(() => {
    setIsAddModalShown(false);
  }, []);

  const handleMemberAddModalOpen = useCallback(() => {
    setIsAddModalShown(true);
  }, []);

  return (
    <>
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={handleRoleModalOpen}
        onMemberAddModalOpen={handleMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />
      {selectedMember && (
        <MemberRoleModal
          open={isRoleModalShow}
          member={selectedMember}
          loading={updateLoading}
          onClose={handleRoleModalClose}
          onUpdateRole={onUpdateRole}
        />
      )}
      <MemberAddModal
        open={isAddModalShow}
        workspaceUserMembers={workspaceUserMembers}
        searchLoading={searchLoading}
        addLoading={addLoading}
        onUserSearch={onUserSearch}
        onClose={handleMemberAddModalClose}
        onSubmit={onUsersAddToWorkspace}
      />
    </>
  );
};

export default Member;

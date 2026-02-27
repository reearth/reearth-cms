import { useCallback, useState } from "react";

import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import MemberTable from "@reearth-cms/components/molecules/Member/MemberTable";
import { Role, User } from "@reearth-cms/components/molecules/Member/types";
import { MemberInput, UserMember } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  addLoading: boolean;
  hasChangeRoleRight: boolean;
  hasInviteRight: boolean;
  hasRemoveRight: boolean;
  isAbleToLeave: boolean;
  loading: boolean;
  onLeave: (userId: string) => Promise<void>;
  onMemberRemoveFromWorkspace: (userIds: string[]) => Promise<void>;
  onReload: () => void;
  onSearchTerm: (term?: string) => void;
  onTableChange: (page: number, pageSize: number) => void;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
  onUsersAddToWorkspace: (users: MemberInput[]) => Promise<void>;
  onUserSearch: (nameOrEmail: string) => Promise<User[]>;
  page: number;
  pageSize: number;
  searchLoading: boolean;
  updateLoading: boolean;
  userId?: string;
  workspaceUserMembers?: UserMember[];
};

const Member: React.FC<Props> = ({
  addLoading,
  hasChangeRoleRight,
  hasInviteRight,
  hasRemoveRight,
  isAbleToLeave,
  loading,
  onLeave,
  onMemberRemoveFromWorkspace,
  onReload,
  onSearchTerm,
  onTableChange,
  onUpdateRole,
  onUsersAddToWorkspace,
  onUserSearch,
  page,
  pageSize,
  searchLoading,
  updateLoading,
  userId,
  workspaceUserMembers,
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
        hasChangeRoleRight={hasChangeRoleRight}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        isAbleToLeave={isAbleToLeave}
        loading={loading}
        onLeave={onLeave}
        onMemberAddModalOpen={handleMemberAddModalOpen}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onReload={onReload}
        onRoleModalOpen={handleRoleModalOpen}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        page={page}
        pageSize={pageSize}
        userId={userId}
        workspaceUserMembers={workspaceUserMembers}
      />
      {selectedMember && (
        <MemberRoleModal
          loading={updateLoading}
          member={selectedMember}
          onClose={handleRoleModalClose}
          onUpdateRole={onUpdateRole}
          open={isRoleModalShow}
        />
      )}
      <MemberAddModal
        addLoading={addLoading}
        onClose={handleMemberAddModalClose}
        onSubmit={onUsersAddToWorkspace}
        onUserSearch={onUserSearch}
        open={isAddModalShow}
        searchLoading={searchLoading}
        workspaceUserMembers={workspaceUserMembers}
      />
    </>
  );
};

export default Member;

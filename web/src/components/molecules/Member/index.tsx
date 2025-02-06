import { useCallback, useState } from "react";

import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import MemberTable from "@reearth-cms/components/molecules/Member/MemberTable";
import { User, Role } from "@reearth-cms/components/molecules/Member/types";
import { UserMember, MemberInput } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  userId?: string;
  isAbleToLeave: boolean;
  onMemberRemoveFromWorkspace: (userIds: string[]) => Promise<void>;
  onLeave: (userId: string) => Promise<void>;
  onSearchTerm: (term?: string) => void;
  workspaceUserMembers?: UserMember[];
  page: number;
  pageSize: number;
  onTableChange: (page: number, pageSize: number) => void;
  loading: boolean;
  onReload: () => void;
  hasInviteRight: boolean;
  hasRemoveRight: boolean;
  hasChangeRoleRight: boolean;

  updateLoading: boolean;
  onMemberOfWorkspaceUpdate: (userId: string, role: Role) => Promise<void>;

  searchedUsers: User[];
  selectedUsers: User[];
  searchLoading: boolean;
  addLoading: boolean;
  onUserSearch: (nameOrEmail: string) => Promise<void>;
  onUserAdd: (user: User) => void;
  onUsersAddToWorkspace: (users: MemberInput[]) => Promise<void>;
  setSearchedUsers: (user: User[]) => void;
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;
};

const Member: React.FC<Props> = ({
  userId,
  isAbleToLeave,
  onMemberRemoveFromWorkspace,
  onLeave,
  onSearchTerm,
  workspaceUserMembers,
  page,
  pageSize,
  onTableChange,
  loading,
  onReload,
  hasInviteRight,
  hasRemoveRight,
  hasChangeRoleRight,

  updateLoading,
  onMemberOfWorkspaceUpdate,

  searchedUsers,
  selectedUsers,
  searchLoading,
  addLoading,
  onUserAdd,
  onUserSearch,
  onUsersAddToWorkspace,
  setSearchedUsers,
  setSelectedUsers,
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
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={handleRoleModalOpen}
        onMemberAddModalOpen={handleMemberAddModalOpen}
        workspaceUserMembers={workspaceUserMembers}
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
          onSubmit={onMemberOfWorkspaceUpdate}
        />
      )}
      <MemberAddModal
        open={isAddModalShow}
        searchedUsers={searchedUsers}
        selectedUsers={selectedUsers}
        searchLoading={searchLoading}
        addLoading={addLoading}
        onUserSearch={onUserSearch}
        onUserAdd={onUserAdd}
        onClose={handleMemberAddModalClose}
        onSubmit={onUsersAddToWorkspace}
        setSearchedUsers={setSearchedUsers}
        setSelectedUsers={setSelectedUsers}
      />
    </>
  );
};

export default Member;

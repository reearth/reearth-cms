import MemberWrapper from "@reearth-cms/components/molecules/Member";

import useHooks from "./hooks";

const Members: React.FC = () => {
  const {
    userId,
    isAbleToLeave,
    searchedUsers,
    handleSearchTerm,
    setSearchedUsers,
    selectedUsers,
    setSelectedUsers,
    handleUserSearch,
    searchLoading,
    handleUserAdd,
    addLoading,
    handleUsersAddToWorkspace,
    updateLoading,
    handleMemberOfWorkspaceUpdate,
    handleMemberRemoveFromWorkspace,
    handleLeave,
    workspaceUserMembers,
    page,
    pageSize,
    handleTableChange,
    loading,
    handleReload,
    hasInviteRight,
    hasRemoveRight,
    hasChangeRoleRight,
  } = useHooks();

  return (
    <MemberWrapper
      workspaceUserMembers={workspaceUserMembers}
      userId={userId}
      isAbleToLeave={isAbleToLeave}
      onMemberRemoveFromWorkspace={handleMemberRemoveFromWorkspace}
      onLeave={handleLeave}
      onSearchTerm={handleSearchTerm}
      page={page}
      pageSize={pageSize}
      onTableChange={handleTableChange}
      loading={loading}
      onReload={handleReload}
      hasInviteRight={hasInviteRight}
      hasRemoveRight={hasRemoveRight}
      hasChangeRoleRight={hasChangeRoleRight}
      updateLoading={updateLoading}
      onMemberOfWorkspaceUpdate={handleMemberOfWorkspaceUpdate}
      searchedUsers={searchedUsers}
      selectedUsers={selectedUsers}
      searchLoading={searchLoading}
      addLoading={addLoading}
      onUserSearch={handleUserSearch}
      onUserAdd={handleUserAdd}
      onUsersAddToWorkspace={handleUsersAddToWorkspace}
      setSearchedUsers={setSearchedUsers}
      setSelectedUsers={setSelectedUsers}
    />
  );
};

export default Members;

import MemberWrapper from "@reearth-cms/components/molecules/Member";

import useHooks from "./hooks";

const Members: React.FC = () => {
  const {
    userId,
    isAbleToLeave,
    handleSearchTerm,
    handleUserSearch,
    searchLoading,
    addLoading,
    handleUsersAddToWorkspace,
    updateLoading,
    handleUpdateRole,
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
      onUpdateRole={handleUpdateRole}
      searchLoading={searchLoading}
      addLoading={addLoading}
      onUserSearch={handleUserSearch}
      onUsersAddToWorkspace={handleUsersAddToWorkspace}
    />
  );
};

export default Members;

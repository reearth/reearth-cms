import MemberWrapper from "@reearth-cms/components/molecules/Member";

import useHooks from "./hooks";

const Members: React.FC = () => {
  const {
    addLoading,
    handleLeave,
    handleMemberRemoveFromWorkspace,
    handleReload,
    handleSearchTerm,
    handleTableChange,
    handleUpdateRole,
    handleUsersAddToWorkspace,
    handleUserSearch,
    hasChangeRoleRight,
    hasInviteRight,
    hasRemoveRight,
    isAbleToLeave,
    loading,
    page,
    pageSize,
    searchLoading,
    updateLoading,
    userId,
    workspaceUserMembers,
  } = useHooks();

  return (
    <MemberWrapper
      addLoading={addLoading}
      hasChangeRoleRight={hasChangeRoleRight}
      hasInviteRight={hasInviteRight}
      hasRemoveRight={hasRemoveRight}
      isAbleToLeave={isAbleToLeave}
      loading={loading}
      onLeave={handleLeave}
      onMemberRemoveFromWorkspace={handleMemberRemoveFromWorkspace}
      onReload={handleReload}
      onSearchTerm={handleSearchTerm}
      onTableChange={handleTableChange}
      onUpdateRole={handleUpdateRole}
      onUsersAddToWorkspace={handleUsersAddToWorkspace}
      onUserSearch={handleUserSearch}
      page={page}
      pageSize={pageSize}
      searchLoading={searchLoading}
      updateLoading={updateLoading}
      userId={userId}
      workspaceUserMembers={workspaceUserMembers}
    />
  );
};

export default Members;

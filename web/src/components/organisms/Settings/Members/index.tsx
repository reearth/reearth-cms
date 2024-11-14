import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import MemberTable from "@reearth-cms/components/molecules/Member/MemberTable";

import useHooks from "./hooks";

const Members: React.FC = () => {
  const {
    me,
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
    selectedMember,
    roleModalShown,
    handleMemberRemoveFromWorkspace,
    handleLeave,
    handleRoleModalClose,
    handleRoleModalOpen,
    handleMemberAddModalClose,
    handleMemberAddModalOpen,
    MemberAddModalShown,
    workspaceUserMembers,
    selection,
    setSelection,
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
    <>
      <MemberTable
        me={me}
        isAbleToLeave={isAbleToLeave}
        handleMemberRemoveFromWorkspace={handleMemberRemoveFromWorkspace}
        onLeave={handleLeave}
        handleSearchTerm={handleSearchTerm}
        handleRoleModalOpen={handleRoleModalOpen}
        handleMemberAddModalOpen={handleMemberAddModalOpen}
        workspaceUserMembers={workspaceUserMembers}
        selection={selection}
        setSelection={setSelection}
        page={page}
        pageSize={pageSize}
        onTableChange={handleTableChange}
        loading={loading}
        onReload={handleReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />
      {selectedMember && (
        <MemberRoleModal
          open={roleModalShown}
          member={selectedMember}
          loading={updateLoading}
          onClose={handleRoleModalClose}
          onSubmit={handleMemberOfWorkspaceUpdate}
        />
      )}
      <MemberAddModal
        open={MemberAddModalShown}
        searchedUsers={searchedUsers}
        selectedUsers={selectedUsers}
        searchLoading={searchLoading}
        addLoading={addLoading}
        onUserSearch={handleUserSearch}
        onUserAdd={handleUserAdd}
        onClose={handleMemberAddModalClose}
        onSubmit={handleUsersAddToWorkspace}
        setSearchedUsers={setSearchedUsers}
        setSelectedUsers={setSelectedUsers}
      />
    </>
  );
};

export default Members;

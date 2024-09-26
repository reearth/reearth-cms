import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import MemberTable from "@reearth-cms/components/molecules/Member/MemberTable";

import useHooks from "./hooks";

const Members: React.FC = () => {
  const {
    me,
    isOwner,
    isAbleToLeave,
    searchedUser,
    handleSearchTerm,
    changeSearchedUser,
    searchedUserList,
    changeSearchedUserList,
    handleUserSearch,
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
  } = useHooks();

  return (
    <>
      <MemberTable
        me={me}
        isOwner={isOwner}
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
        searchedUser={searchedUser}
        searchedUserList={searchedUserList}
        addLoading={addLoading}
        onUserSearch={handleUserSearch}
        onUserAdd={handleUserAdd}
        onClose={handleMemberAddModalClose}
        onSubmit={handleUsersAddToWorkspace}
        changeSearchedUser={changeSearchedUser}
        changeSearchedUserList={changeSearchedUserList}
      />
    </>
  );
};

export default Members;

import styled from "@emotion/styled";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Search from "@reearth-cms/components/atoms/Search";
import Table from "@reearth-cms/components/atoms/Table";
import { Member } from "@reearth-cms/components/molecules/Dashboard/types";
import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Thumbnail",
    dataIndex: "thumbnail",
    key: "thumbnail",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
  },
];

const Members: React.FC = () => {
  const t = useT();
  const { workspaceId } = useParams();

  const { confirm } = Modal;

  const {
    me,
    currentWorkspace,
    searchedUser,
    changeSearchedUser,
    handleUserSearch,
    handleMemberAddToWorkspace,
    handleMemberOfWorkspaceUpdate,
    selectedMember,
    roleModalShown,
    handleMemberRemoveFromWorkspace,
    handleRoleModalClose,
    handleRoleModalOpen,
    handleMemberAddModalClose,
    handleMemberAddModalOpen,
    MemberAddModalShown,
  } = useHooks({ workspaceId });

  const members = currentWorkspace?.members;

  const handleMemberDelete = useCallback(
    (member: Member) => {
      confirm({
        title: <>{t("Are you sure to remove this member?")}</>,
        icon: <Icon icon="exclamationCircle" />,
        content: (
          <>
            {t(
              "Remove this member from workspace means this member will not view any content of this workspace.s",
            )}
          </>
        ),
        onOk() {
          handleMemberRemoveFromWorkspace(member?.userId);
        },
      });
    },
    [confirm, handleMemberRemoveFromWorkspace, t],
  );

  const dataSource = members?.map(member => ({
    key: member.userId,
    name: member.user.name,
    thumbnail: (
      <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
        {member.user.name.charAt(0)}
      </Avatar>
    ),
    email: member.user.email,
    role: member.role,
    action: (
      <>
        {member.userId !== me?.id && (
          <a onClick={() => handleRoleModalOpen(member)}>{t("Change Role?")}</a>
        )}
        {member.role !== "OWNER" && (
          <a style={{ marginLeft: "8px" }} onClick={() => handleMemberDelete(member)}>
            {t("Remove")}
          </a>
        )}
      </>
    ),
  }));

  return (
    <>
      <PaddedContent>
        <MemberPageHeader
          title={t("Members")}
          extra={
            <Button
              type="primary"
              onClick={handleMemberAddModalOpen}
              icon={<Icon icon="userGroupAdd" />}>
              {t("New Member")}
            </Button>
          }></MemberPageHeader>
        <ActionHeader>
          <Search placeholder={t("input search text")} allowClear style={{ width: 264 }} />
        </ActionHeader>
        <Table dataSource={dataSource} columns={columns} style={{ padding: "24px" }} />;
      </PaddedContent>
      <MemberRoleModal
        member={selectedMember}
        open={roleModalShown}
        onClose={handleRoleModalClose}
        onSubmit={handleMemberOfWorkspaceUpdate}></MemberRoleModal>
      <MemberAddModal
        open={MemberAddModalShown}
        searchedUser={searchedUser}
        onClose={handleMemberAddModalClose}
        handleUserSearch={handleUserSearch}
        changeSearchedUser={changeSearchedUser}
        onSubmit={handleMemberAddToWorkspace}></MemberAddModal>
    </>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
`;

const ActionHeader = styled(Content)`
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

const MemberPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #f0f0f0;
`;

export default Members;

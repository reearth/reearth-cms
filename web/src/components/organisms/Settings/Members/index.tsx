import {
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import MemberCreationModal from "@reearth-cms/components/molecules/Member/MemberCreationModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import { PageHeader, Table, Modal } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import Search from "antd/lib/input/Search";
import { Content } from "antd/lib/layout/layout";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

import useDashboardHooks from "../../Dashboard/hooks";

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
  const { workspaceId } = useParams();

  const { confirm } = Modal;

  const { handleModalClose, modalShown, handleWorkspaceCreate } =
    useDashboardHooks(workspaceId);

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
    handleMemberCreationModalClose,
    handleMemberCreationModalOpen,
    memberCreationModalShown,
  } = useHooks({ workspaceId });

  const members = currentWorkspace?.members;

  const showConfirm = useCallback(
    (member: any) => {
      confirm({
        title: "Are you sure to remove this member?",
        icon: <ExclamationCircleOutlined />,
        content:
          "Remove this member from workspace means this member will not view any content of this workspace.",
        onOk() {
          handleMemberRemoveFromWorkspace(member?.userId);
        },
        onCancel() {},
      });
    },
    [confirm, handleMemberRemoveFromWorkspace]
  );

  const dataSource = members?.map((member) => ({
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
          <a onClick={() => handleRoleChange(member)}>Change Role</a>
        )}
        {member.role !== "OWNER" && (
          <a
            style={{ marginLeft: "8px" }}
            onClick={() => handleMemberDelete(member)}
          >
            Remove
          </a>
        )}
      </>
    ),
  }));

  const handleRoleChange = useCallback(
    (member: any) => {
      handleRoleModalOpen(member);
    },
    [handleRoleModalOpen]
  );

  const handleMemberDelete = useCallback(
    (member: any) => {
      showConfirm(member);
    },
    [showConfirm]
  );

  const handleMemberAdd = useCallback(() => {
    if (!searchedUser) return;
    handleMemberAddToWorkspace([searchedUser.id]);
    changeSearchedUser(undefined);
    handleMemberCreationModalClose();
  }, [
    searchedUser,
    handleMemberAddToWorkspace,
    changeSearchedUser,
    handleMemberCreationModalClose,
  ]);

  return (
    <>
      <PaddedContent>
        <MemberPageHeader
          title="Members"
          extra={
            <Button
              type="primary"
              onClick={handleMemberCreationModalOpen}
              icon={<UsergroupAddOutlined />}
            >
              New Member
            </Button>
          }
        ></MemberPageHeader>
        <ActionHeader>
          <Search
            placeholder="input search text"
            allowClear
            style={{ width: 264 }}
          />
        </ActionHeader>
        <Table
          dataSource={dataSource}
          columns={columns}
          style={{ padding: "24px" }}
        />
        ;
      </PaddedContent>
      <WorkspaceCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={handleWorkspaceCreate}
      ></WorkspaceCreationModal>
      <MemberRoleModal
        member={selectedMember}
        open={roleModalShown}
        onClose={handleRoleModalClose}
        onSubmit={handleMemberOfWorkspaceUpdate}
      ></MemberRoleModal>
      <MemberCreationModal
        open={memberCreationModalShown}
        searchedUser={searchedUser}
        onClose={handleMemberCreationModalClose}
        handleUserSearch={handleUserSearch}
        changeSearchedUser={changeSearchedUser}
        onSubmit={handleMemberAdd}
      ></MemberCreationModal>
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

import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import List from "@reearth-cms/components/atoms/List";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";
import { PageHeader, Table } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import Search from "antd/lib/input/Search";
import Layout, { Header, Content } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
  const [collapsed, setCollapsed] = useState(false);

  const {
    user,
    personalWorkspace,
    workspaces,
    handleModalClose,
    handleModalOpen,
    modalShown,
  } = useDashboardHooks(workspaceId);

  const {
    me,
    currentWorkspace,
    searchedUser,
    changeSearchedUser,
    handleWorkspaceDelete,
    handleUserSearch,
    handleNameUpdate,
    handleWorkspaceCreate,
    handleMemberAddToWorkspace,
    handleMemberOfWorkspaceUpdate,
    handleMemberRemoveFromWorkspace,
  } = useHooks({ workspaceId });

  const [owner, setOwner] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const navigate = useNavigate();
  const members = currentWorkspace?.members;
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
    action: "Hello",
  }));
  const handleMemberNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMemberName?.(e.currentTarget.value);
      handleUserSearch(e.currentTarget.value);
    },
    [setMemberName, handleUserSearch]
  );

  const handleMemberAdd = useCallback(() => {
    if (!searchedUser) return;
    handleMemberAddToWorkspace([searchedUser.id]);
    setMemberName("");
    changeSearchedUser(undefined);
  }, [searchedUser, handleMemberAddToWorkspace, changeSearchedUser]);

  const handleWorkspaceDeletion = useCallback(async () => {
    await handleWorkspaceDelete();
    navigate("/workspaces");
  }, [handleWorkspaceDelete, navigate]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWorkspaceName?.(e.currentTarget.value);
    },
    [setWorkspaceName]
  );

  const handleWorkspaceNameChange = useCallback(() => {
    if (!workspaceName) return;
    handleNameUpdate(workspaceName);
    setWorkspaceName("");
  }, [setWorkspaceName, workspaceName, handleNameUpdate]);

  const checkOwner = useCallback(() => {
    if (members) {
      for (let i = 0; i < members.length; i++) {
        if (members[i].userId === me?.id && members[i].role === "OWNER") {
          return true;
        }
      }
    }
    return false;
  }, [members, me?.id]);

  useEffect(() => {
    const o = checkOwner();
    setOwner(o);
  }, [checkOwner]);

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Header>
          <MoleculeHeader
            handleModalOpen={handleModalOpen}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          ></MoleculeHeader>
        </Header>
        <Layout>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            style={{ backgroundColor: "#fff" }}
          >
            <WorkspaceMenu
              isPersonalWorkspace={
                personalWorkspace?.id === currentWorkspace?.id
              }
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            ></WorkspaceMenu>
          </Sider>
          <PaddedContent>
            <MemberPageHeader
              title="Members"
              extra={
                <Button onClick={handleModalOpen}>Create a Workspace</Button>
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
        </Layout>
      </Layout>
      <WorkspaceCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={handleWorkspaceCreate}
      ></WorkspaceCreationModal>
    </>
  );
  return;
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

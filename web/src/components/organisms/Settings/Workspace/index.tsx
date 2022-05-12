import styled from "@emotion/styled";
import { Button, Form, Input, Layout, List } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHooks, { RoleUnion } from "./hooks";

const WorkspaceSettings: React.FC<Props> = () => {
  const { workspaceId } = useParams();
  const {
    me,
    currentWorkspace,
    searchedUser,
    changeSearchedUser,
    deleteWorkspace,
    searchUser,
    updateName,
    addMembersToWorkspace,
    updateMemberOfWorkspace,
    removeMemberFromWorkspace,
  } = useHooks({ workspaceId });
  const [owner, setOwner] = useState(false);
  const [memberName, setMemberName] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const navigate = useNavigate();
  const members = currentWorkspace?.members;

  const handleMemberNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMemberName?.(e.currentTarget.value);
      searchUser(e.currentTarget.value);
    },
    [setMemberName, searchUser]
  );

  const handleAddMember = useCallback(() => {
    if (!searchedUser) return;
    addMembersToWorkspace([searchedUser.id]);
    setMemberName("");
    changeSearchedUser(undefined);
  }, [searchedUser, addMembersToWorkspace, changeSearchedUser]);

  const handleDeleteWorkspace = useCallback(async () => {
    await deleteWorkspace();
    navigate("/workspace");
  }, [deleteWorkspace, navigate]);

  const handleDeleteMember = useCallback(
    async (userId: string) => {
      await removeMemberFromWorkspace(userId);
    },
    [removeMemberFromWorkspace]
  );

  const handleUpdateMember = useCallback(
    async (userId: string, role: RoleUnion) => {
      await updateMemberOfWorkspace(userId, role);
    },
    [updateMemberOfWorkspace]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWorkspaceName?.(e.currentTarget.value);
    },
    [setWorkspaceName]
  );

  const handleWorkspaceNameChange = useCallback(() => {
    if (!workspaceName) return;
    updateName(workspaceName);
    setWorkspaceName("");
  }, [setWorkspaceName, workspaceName, updateName]);

  const checkOwner = useCallback(() => {
    if (members) {
      console.log(members);

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

  return currentWorkspace ? (
    <Layout>
      <LightHeader>{currentWorkspace?.name}</LightHeader>
      <PaddedContent>
        <PaddedDiv>
          <Button onClick={() => navigate("/workspace")}>Workspace List</Button>
          {owner && !currentWorkspace?.personal && (
            <Button onClick={() => handleDeleteWorkspace()} danger>
              Delete Workspace
            </Button>
          )}
        </PaddedDiv>

        {!currentWorkspace?.personal && (
          <PaddedDiv>
            <h2>Add User</h2>
            <Form style={{ maxWidth: "300px" }}>
              <Form.Item label="Workspace name">
                <Input
                  min={8}
                  max={12}
                  value={workspaceName}
                  onChange={handleNameChange}
                />
                {workspaceName && (
                  <Button onClick={() => handleWorkspaceNameChange()}>
                    Change name
                  </Button>
                )}
              </Form.Item>
            </Form>
          </PaddedDiv>
        )}

        {!currentWorkspace?.personal && (
          <PaddedDiv>
            <h2>Add User</h2>
            <Form style={{ maxWidth: "300px" }}>
              <Form.Item label="User name">
                <Input
                  min={8}
                  max={12}
                  value={memberName}
                  onChange={handleMemberNameChange}
                />
                {searchedUser && (
                  <Button onClick={() => handleAddMember()}>
                    {searchedUser.name}
                  </Button>
                )}
              </Form.Item>
            </Form>
          </PaddedDiv>
        )}
        <PaddedDiv>
          <h1>Members</h1>
          <List
            itemLayout="horizontal"
            dataSource={members}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.user.name}
                  description={item.role}
                />
                {item.userId != me.id && (
                  <>
                    <Button
                      onClick={() => handleUpdateMember(item.userId, "READER")}
                    >
                      READER
                    </Button>
                    <Button
                      onClick={() => handleUpdateMember(item.userId, "WRITER")}
                    >
                      WRITER
                    </Button>
                    <Button
                      onClick={() => handleUpdateMember(item.userId, "OWNER")}
                    >
                      OWNER
                    </Button>
                    <Button
                      onClick={() => handleDeleteMember(item.userId)}
                      danger
                    >
                      Delete Member
                    </Button>
                  </>
                )}
              </List.Item>
            )}
          />
        </PaddedDiv>
      </PaddedContent>
    </Layout>
  ) : null;
};

const LightHeader = styled(Header)`
  background-color: #add8e6;
  font-weight: 800;
  font-size: 26px;
`;

const PaddedContent = styled(Content)`
  min-height: 280px;
  padding: 24px 50px;
  background: #fff;
`;

const PaddedDiv = styled.div`
  padding: 24px 0;
`;

export default WorkspaceSettings;

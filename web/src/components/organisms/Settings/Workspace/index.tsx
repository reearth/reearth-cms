import styled from "@emotion/styled";
import { Button, Form, Input, Layout, List } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHooks from "./hooks";

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
  const navigate = useNavigate();
  const members = currentWorkspace?.members;

  const handleMemberNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMemberName?.(e.currentTarget.value);
      searchUser(e.currentTarget.value);
    },
    [setMemberName, searchUser, memberName]
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
        {!currentWorkspace?.personal && (
          <PaddedDiv>
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
          {owner && !currentWorkspace?.personal && (
            <Button onClick={() => handleDeleteWorkspace()} danger>
              Delete Workspace
            </Button>
          )}
        </PaddedDiv>
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
                  <Button
                    onClick={() => handleDeleteMember(item.userId)}
                    danger
                  >
                    Delete Member
                  </Button>
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

import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import List from "@reearth-cms/components/atoms/List";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHooks from "./hooks";

const Workspace: React.FC = () => {
  const { workspaceId } = useParams();

  const {
    me,
    currentWorkspace,
    searchedUser,
    changeSearchedUser,
    handleWorkspaceDelete,
    handleUserSearch,
    handleNameUpdate,
    handleMemberAddToWorkspace,
    handleMemberOfWorkspaceUpdate,
    handleMemberRemoveFromWorkspace,
  } = useHooks({ workspaceId });

  const [owner, setOwner] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const navigate = useNavigate();
  const members = currentWorkspace?.members;

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

  const handleWorkspaceDeleteAction = useCallback(async () => {
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
    <>
      <PaddedDiv>
        <h1>{currentWorkspace?.name}</h1>
      </PaddedDiv>
      <PaddedDiv>
        <Button onClick={() => navigate("/workspaces")}>Workspace List</Button>
        {owner && !currentWorkspace?.personal && (
          <Button onClick={() => handleWorkspaceDeleteAction()} danger>
            Delete Workspace
          </Button>
        )}
      </PaddedDiv>

      {!currentWorkspace?.personal && (
        <PaddedDiv>
          <h2>Workspace name</h2>
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
                <Button onClick={() => handleMemberAdd()}>
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
              <List.Item.Meta title={item.user.name} description={item.role} />
              {item.userId != me.id && (
                <>
                  <Button
                    onClick={() =>
                      handleMemberOfWorkspaceUpdate(item.userId, "READER")
                    }
                  >
                    READER
                  </Button>
                  <Button
                    onClick={() =>
                      handleMemberOfWorkspaceUpdate(item.userId, "WRITER")
                    }
                  >
                    WRITER
                  </Button>
                  <Button
                    onClick={() =>
                      handleMemberOfWorkspaceUpdate(item.userId, "OWNER")
                    }
                  >
                    OWNER
                  </Button>
                  {item.role !== "OWNER" && (
                    <Button
                      onClick={() =>
                        handleMemberRemoveFromWorkspace(item.userId)
                      }
                      danger
                    >
                      Delete Member
                    </Button>
                  )}
                </>
              )}
            </List.Item>
          )}
        />
      </PaddedDiv>
    </>
  ) : null;
};

const PaddedDiv = styled.div`
  padding: 24px 50px;
`;

export default Workspace;

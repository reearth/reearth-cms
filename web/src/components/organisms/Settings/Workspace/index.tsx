import styled from "@emotion/styled";
import { Button } from "antd";
import Layout, { Content, Header } from "antd/lib/layout/layout";
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
    updateName,
    addMembersToWorkspace,
    updateMemberOfWorkspace,
    removeMemberFromWorkspace,
  } = useHooks({ workspaceId });
  const [owner, setOwner] = useState(false);
  const navigate = useNavigate();
  const members = currentWorkspace?.members;

  const handleDeleteWorkspace = useCallback(() => {
    deleteWorkspace();
    navigate("/workspace");
  }, [deleteWorkspace, navigate]);

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
    <Layout>
      <LightHeader>{currentWorkspace?.name}</LightHeader>
      <PaddedContent>
        <PaddedDiv>
          {owner && !currentWorkspace?.personal && (
            <Button onClick={() => handleDeleteWorkspace()} danger>
              Delete
            </Button>
          )}
        </PaddedDiv>
      </PaddedContent>
    </Layout>
  );
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

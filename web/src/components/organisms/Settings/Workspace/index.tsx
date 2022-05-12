import React, { useCallback, useEffect, useState } from "react";

import useHooks from "./hooks";

type Props = {
  workspaceId: string;
};

const WorkspaceSettings: React.FC<Props> = ({ workspaceId }) => {
  const {
    me,
    currentWorkspace,
    // searchedUser,
    // changeSearchedUser,
    // deleteWorkspace,
    // updateName,
    // addMembersToWorkspace,
    // updateMemberOfWorkspace,
    // removeMemberFromWorkspace,
  } = useHooks({ workspaceId });
  const [_, setOwner] = useState(false);
  const members = currentWorkspace?.members;

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
      <h1>Hello</h1>
      <h1>{currentWorkspace?.name}</h1>
    </>
  );
};

export default WorkspaceSettings;

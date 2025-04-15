import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

import MemberWrapper from ".";

describe("Member", () => {
  const user = userEvent.setup();

  const userId = "userId1";
  const isAbleToLeave = false;
  const onMemberRemoveFromWorkspace = () => {
    return Promise.resolve();
  };
  const onLeave = () => {
    return Promise.resolve();
  };
  const onSearchTerm = () => {};
  const workspaceUserMembers: UserMember[] = [
    {
      userId: "userId2",
      role: "OWNER",
      user: { id: "id2", name: "name2", email: "email2@test.com" },
    },
    { userId, role: "OWNER", user: { id: "id1", name: "name1", email: "email1@test.com" } },
  ];
  const page = 1;
  const pageSize = 10;
  const onTableChange = () => {};
  const loading = false;
  const onReload = () => {};
  const hasInviteRight = true;
  const hasRemoveRight = true;
  const hasChangeRoleRight = true;

  const updateLoading = false;
  const onUpdateRole = () => {
    return Promise.resolve();
  };

  const searchLoading = false;
  const addLoading = false;
  const onUserSearch = () => {
    return Promise.resolve([]);
  };
  const onUsersAddToWorkspace = () => {
    return Promise.resolve();
  };

  test("Add member modal is opened successfully", async () => {
    render(
      <MemberWrapper
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
        updateLoading={updateLoading}
        onUpdateRole={onUpdateRole}
        searchLoading={searchLoading}
        addLoading={addLoading}
        onUserSearch={onUserSearch}
        onUsersAddToWorkspace={onUsersAddToWorkspace}
      />,
    );

    await user.click(screen.getByRole("button", { name: "usergroup-add New Member" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Role settings modal is displayed successfully", async () => {
    render(
      <MemberWrapper
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
        updateLoading={updateLoading}
        onUpdateRole={onUpdateRole}
        searchLoading={searchLoading}
        addLoading={addLoading}
        onUserSearch={onUserSearch}
        onUsersAddToWorkspace={onUsersAddToWorkspace}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Change Role?" })[0]);
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

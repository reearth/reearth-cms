import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

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
      role: "OWNER",
      user: { email: "email2@test.com", id: "id2", name: "name2" },
      userId: "userId2",
    },
    { role: "OWNER", user: { email: "email1@test.com", id: "id1", name: "name1" }, userId },
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
        addLoading={addLoading}
        hasChangeRoleRight={hasChangeRoleRight}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        isAbleToLeave={isAbleToLeave}
        loading={loading}
        onLeave={onLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onReload={onReload}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        onUpdateRole={onUpdateRole}
        onUsersAddToWorkspace={onUsersAddToWorkspace}
        onUserSearch={onUserSearch}
        page={page}
        pageSize={pageSize}
        searchLoading={searchLoading}
        updateLoading={updateLoading}
        userId={userId}
        workspaceUserMembers={workspaceUserMembers}
      />,
    );

    await user.click(screen.getByRole("button", { name: "usergroup-addNew Member" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Role settings modal is displayed successfully", async () => {
    render(
      <MemberWrapper
        addLoading={addLoading}
        hasChangeRoleRight={hasChangeRoleRight}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        isAbleToLeave={isAbleToLeave}
        loading={loading}
        onLeave={onLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onReload={onReload}
        onSearchTerm={onSearchTerm}
        onTableChange={onTableChange}
        onUpdateRole={onUpdateRole}
        onUsersAddToWorkspace={onUsersAddToWorkspace}
        onUserSearch={onUserSearch}
        page={page}
        pageSize={pageSize}
        searchLoading={searchLoading}
        updateLoading={updateLoading}
        userId={userId}
        workspaceUserMembers={workspaceUserMembers}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Change Role?" })[0]);
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

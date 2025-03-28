import { render, screen, getByText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

import MemberTable from ".";

describe("Member table", () => {
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
  const onRoleModalOpen = () => {};
  const onMemberAddModalOpen = () => {};
  const workspaceUserMembers: UserMember[] = [
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

  const secondMember = { id: "id2", name: "name2", email: "email2@test.com" };

  test("Table options works successfully", async () => {
    const reloadMock = vi.fn();

    render(
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={reloadMock}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    const reloadIcon = screen.getByLabelText("reload");
    const heightIcon = screen.getByLabelText("column-height");
    const settingIcon = screen.getByLabelText("setting");

    await user.click(reloadIcon);
    expect(reloadMock).toHaveBeenCalled();
    expect(heightIcon).toBeVisible();
    expect(settingIcon).toBeVisible();
    expect(screen.getByTitle(page)).toBeVisible();
    expect(screen.getByText(`${pageSize} / page`)).toBeVisible();
  });

  test("Page number and number of items per page are displayed successfully", () => {
    render(
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    expect(screen.getByTitle(page)).toBeVisible();
    expect(screen.getByText(`${pageSize} / page`)).toBeVisible();
  });

  test("Searching works successfully", async () => {
    const searchMock = vi.fn();

    render(
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={searchMock}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    const search = screen.getByPlaceholderText("input search text");
    const searchButton = screen.getByRole("button", { name: "search" });
    await user.click(search);
    await user.keyboard("[Enter]");
    await user.click(searchButton);
    expect(searchMock).toBeCalledTimes(2);
  });

  test("Data is displayed successfully", () => {
    render(
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    const { user, role } = workspaceUserMembers[0];

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Thumbnail")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText(user.name)).toBeVisible();
    expect(screen.getByText(user.email)).toBeVisible();
    expect(screen.getByText(role)).toBeVisible();
  });

  test("Own checkbox, change role button, and leave button are disabled successfully", async () => {
    render(
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Change Role?" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Leave" })).toBeDisabled();
  });

  test("Leave button works successfully", async () => {
    const onLeaveMock = vi.fn();

    render(
      <MemberTable
        workspaceUserMembers={workspaceUserMembers}
        userId={userId}
        isAbleToLeave={true}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeaveMock}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Leave" }));
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(onLeaveMock).toHaveBeenCalled();
  });

  test("Removing multiple members is fired successfully", async () => {
    const onMemberRemoveFromWorkspaceMock = vi.fn();

    const thirdMember = { id: "id3", name: "name3", email: "email3@test.com" };

    render(
      <MemberTable
        workspaceUserMembers={[
          ...workspaceUserMembers,
          {
            userId: "userId2",
            role: "OWNER",
            user: secondMember,
          },
          {
            userId: "userId3",
            role: "OWNER",
            user: thirdMember,
          },
        ]}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspaceMock}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    await user.click(screen.getByLabelText("Select all"));
    await user.click(screen.getByRole("button", { name: "usergroup-delete Remove" }));
    const dialog = screen.getByRole("dialog");
    await expect.poll(() => dialog).toBeVisible();
    expect(getByText(dialog, secondMember.name)).toBeVisible();
    expect(getByText(dialog, secondMember.email)).toBeVisible();
    expect(getByText(dialog, thirdMember.name)).toBeVisible();
    expect(getByText(dialog, thirdMember.email)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onMemberRemoveFromWorkspaceMock).toHaveBeenCalled();
  });

  test("Removing a member is fired successfully", async () => {
    const onMemberRemoveFromWorkspaceMock = vi.fn();
    render(
      <MemberTable
        workspaceUserMembers={[
          ...workspaceUserMembers,
          {
            userId: "userId2",
            role: "OWNER",
            user: secondMember,
          },
        ]}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspaceMock}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={hasInviteRight}
        hasRemoveRight={hasRemoveRight}
        hasChangeRoleRight={hasChangeRoleRight}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));
    const dialog = screen.getByRole("dialog");
    await expect.poll(() => getByText(dialog, secondMember.name)).toBeVisible();
    expect(getByText(dialog, secondMember.email)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onMemberRemoveFromWorkspaceMock).toHaveBeenCalled();
  });

  test("Buttons are disabled according to user right successfully", async () => {
    render(
      <MemberTable
        workspaceUserMembers={[
          {
            userId: "userId2",
            role: "OWNER",
            user: secondMember,
          },
          ...workspaceUserMembers,
        ]}
        userId={userId}
        isAbleToLeave={isAbleToLeave}
        onMemberRemoveFromWorkspace={onMemberRemoveFromWorkspace}
        onLeave={onLeave}
        onSearchTerm={onSearchTerm}
        onRoleModalOpen={onRoleModalOpen}
        onMemberAddModalOpen={onMemberAddModalOpen}
        page={page}
        pageSize={pageSize}
        onTableChange={onTableChange}
        loading={loading}
        onReload={onReload}
        hasInviteRight={false}
        hasRemoveRight={false}
        hasChangeRoleRight={false}
      />,
    );

    expect(screen.getByRole("button", { name: "usergroup-add New Member" })).toBeDisabled();
    for (const button of screen.getAllByRole("button", { name: "Change Role?" })) {
      expect(button).toBeDisabled();
    }
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Leave" })).toBeDisabled();

    await user.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByRole("button", { name: "usergroup-delete Remove" })).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import MemberAddModal from ".";

describe("Member add modal", () => {
  const user = userEvent.setup();

  const open = true;
  const searchLoading = false;
  const addLoading = false;
  const member = { id: "id", name: "name", email: "email@test.com" };
  const onUserSearch = () => {
    return Promise.resolve([member]);
  };
  const onClose = () => {};
  const onUsersAddToWorkspace = () => {
    return Promise.resolve();
  };

  test("Searching and adding a member is successfully", async () => {
    const onUserSearchMock = vi.fn(onUserSearch);
    const onUsersAddToWorkspaceMock = vi.fn();

    render(
      <MemberAddModal
        open={open}
        searchLoading={searchLoading}
        addLoading={addLoading}
        onUserSearch={onUserSearchMock}
        onClose={onClose}
        onSubmit={onUsersAddToWorkspaceMock}
      />,
    );

    const searchInput = screen.getByLabelText("Search user");
    const addButton = screen.getByRole("button", { name: "Add to workspace" });
    expect(addButton).toBeDisabled();

    await user.click(searchInput);
    await user.type(searchInput, "te");
    await expect.poll(() => screen.getByText("No result")).toBeVisible();

    await user.type(searchInput, "st");
    await expect.poll(() => onUserSearchMock).toHaveBeenCalledWith("test");
    expect(screen.getByText(member.email)).toBeVisible();

    await user.click(screen.getByText(member.name));
    expect(screen.getByText(member.name)).toBeVisible();
    expect(screen.getByText(member.email)).toBeVisible();
    await user.click(screen.getByText("Reader"));
    await expect.poll(() => screen.getByText("Owner")).toBeVisible();
    expect(screen.getByText("Maintainer")).toBeVisible();
    expect(screen.getByText("Writer")).toBeVisible();

    await user.click(addButton);
    expect(onUsersAddToWorkspaceMock).toBeCalledWith([{ userId: member.id, role: "READER" }]);
  });

  test("Loadings are displayed successfully", async () => {
    render(
      <MemberAddModal
        open={open}
        searchLoading={true}
        addLoading={true}
        onUserSearch={onUserSearch}
        onClose={onClose}
        onSubmit={onUsersAddToWorkspace}
      />,
    );

    await expect.poll(() => screen.getByRole("button", { name: "loading" })).toBeVisible();
    expect(screen.getByRole("button", { name: "loading Add to workspace" })).toBeVisible();
  });
});

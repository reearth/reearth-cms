import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import MemberAddModal from ".";

describe("Member add modal", () => {
  const user = userEvent.setup();

  const open = true;
  const searchLoading = false;
  const addLoading = false;
  const member = { email: "email@test.com", id: "id", name: "name" };
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
        addLoading={addLoading}
        onClose={onClose}
        onSubmit={onUsersAddToWorkspaceMock}
        onUserSearch={onUserSearchMock}
        open={open}
        searchLoading={searchLoading}
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
    expect(onUsersAddToWorkspaceMock).toBeCalledWith([{ role: "READER", userId: member.id }]);
  });

  test("Loadings are displayed successfully", async () => {
    render(
      <MemberAddModal
        addLoading={true}
        onClose={onClose}
        onSubmit={onUsersAddToWorkspace}
        onUserSearch={onUserSearch}
        open={open}
        searchLoading={true}
      />,
    );

    await expect.poll(() => screen.getByRole("button", { name: "loading" })).toBeVisible();
    expect(screen.getByRole("button", { name: "loadingAdd to workspace" })).toBeVisible();
  });
});

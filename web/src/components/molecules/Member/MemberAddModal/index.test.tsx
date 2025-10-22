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
  const onUserSearch = (searchTerm: string) => {
    // Return empty results for "tes" to test the no results state
    if (searchTerm === "tes") {
      return Promise.resolve([]);
    }
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
    await user.type(searchInput, "tes");
    await expect.poll(() => screen.getByText("No result")).toBeInTheDocument();

    await user.click(searchInput);
    await user.type(searchInput, "t");
    await expect.poll(() => onUserSearchMock).toHaveBeenCalledWith("test");
    await expect.poll(() => screen.getByText(member.name)).toBeInTheDocument();

    await user.click(screen.getByText(member.name));

    await expect.poll(() => screen.getByTitle(member.name)).toBeInTheDocument();
    await expect.poll(() => screen.getByTitle(member.email)).toBeInTheDocument();
    await user.click(screen.getByText("Reader"));
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Maintainer")).toBeInTheDocument();
    expect(screen.getByText("Writer")).toBeInTheDocument();

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

    // Check for search loading state
    const searchInput = screen.getByLabelText("Search user");
    expect(searchInput).toBeInTheDocument();

    // Check for add button loading state - when loading, the accessible name includes "loading" prefix
    const addButton = screen.getByRole("button", {
      name: /loadingAdd to workspace|Add to workspace/,
    });
    expect(addButton).toHaveClass("ant-btn-loading");
  });
});

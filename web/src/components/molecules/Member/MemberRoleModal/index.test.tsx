import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

import MemberRoleModal from ".";

describe("Member role modal", () => {
  const user = userEvent.setup();

  const open = true;
  const member: UserMember = {
    userId: "userId",
    role: "OWNER",
    user: { id: "id1", name: "name1", email: "email1@test.com" },
  };
  const loading = false;
  const onClose = () => {
    return Promise.resolve();
  };
  const onUpdateRole = () => {
    return Promise.resolve();
  };

  test("Default value is displayed successfully", async () => {
    render(
      <MemberRoleModal
        open={open}
        member={member}
        loading={loading}
        onClose={onClose}
        onUpdateRole={onUpdateRole}
      />,
    );

    await expect.poll(() => screen.getByText("Owner")).toBeVisible();
  });

  test("All options are displayed successfully", async () => {
    render(
      <MemberRoleModal
        open={open}
        member={member}
        loading={loading}
        onClose={onClose}
        onUpdateRole={onUpdateRole}
      />,
    );

    await user.click(screen.getByLabelText("Role"));
    await expect.poll(() => screen.getByText("Maintainer")).toBeVisible();
    expect(screen.getByText("Writer")).toBeVisible();
    expect(screen.getByText("Reader")).toBeVisible();
  });

  test("Ok button is toggled successfully", async () => {
    render(
      <MemberRoleModal
        open={open}
        member={member}
        loading={loading}
        onClose={onClose}
        onUpdateRole={onUpdateRole}
      />,
    );

    const okButton = screen.getByRole("button", { name: "OK" });
    expect(okButton).toBeDisabled();

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Maintainer"));
    expect(okButton).toBeEnabled();

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Owner"));
    expect(okButton).toBeDisabled();
  });

  test("Update event is fired successfully", async () => {
    const onUpdateRoleMock = vi.fn();

    render(
      <MemberRoleModal
        open={open}
        member={member}
        loading={loading}
        onClose={onClose}
        onUpdateRole={onUpdateRoleMock}
      />,
    );

    await user.click(screen.getByLabelText("Role"));
    await user.click(screen.getByText("Maintainer"));
    await user.click(screen.getByRole("button", { name: "OK" }));
    expect(onUpdateRoleMock).toHaveBeenCalled();
  });

  test("Update loading is displayed and cancel button is disabled successfully", async () => {
    render(
      <MemberRoleModal
        open={open}
        member={member}
        loading={true}
        onClose={onClose}
        onUpdateRole={onUpdateRole}
      />,
    );

    await expect.poll(() => screen.getByLabelText("loading")).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  test("Close event is fired successfully", async () => {
    const onCloseMock = vi.fn();

    render(
      <MemberRoleModal
        open={open}
        member={member}
        loading={loading}
        onClose={onCloseMock}
        onUpdateRole={onUpdateRole}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCloseMock).toHaveBeenCalled();
  });
});

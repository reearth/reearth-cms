import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { Role } from "@reearth-cms/components/molecules/Member/types";

import RequestOptions from "./RequestOptions";

describe("Request options", () => {
  const user = userEvent.setup();
  const initialRequestRoles: Role[] = ["WRITER"];

  const hasUpdateRight = true;
  const onProjectRequestRolesUpdate = () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  test("All roles are visible successfully", async () => {
    render(
      <RequestOptions
        initialRequestRoles={initialRequestRoles}
        hasUpdateRight={hasUpdateRight}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
      />,
    );

    expect(screen.getByText("Role")).toBeVisible();
    expect(screen.getByText("Need request")).toBeVisible();
    expect(screen.getByText("Owner")).toBeVisible();
    expect(screen.getByText("Maintainer")).toBeVisible();
    expect(screen.getByText("Writer")).toBeVisible();
    expect(screen.getByText("Reader")).toBeVisible();
    expect(screen.getAllByRole("switch", { checked: true }).length).toBe(
      initialRequestRoles.length,
    );
  });

  test("Save button is toggled successfully", async () => {
    render(
      <RequestOptions
        initialRequestRoles={initialRequestRoles}
        hasUpdateRight={hasUpdateRight}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
      />,
    );

    const firstSwitch = screen.getAllByRole("switch")[0];
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    expect(saveButton).toBeDisabled();
    await user.click(firstSwitch);
    expect(saveButton).toBeEnabled();
    await user.click(firstSwitch);
    expect(saveButton).toBeDisabled();
  });

  test("Update event is called successfully", async () => {
    const onProjectRequestRolesUpdateMock = vi.fn(onProjectRequestRolesUpdate);

    render(
      <RequestOptions
        initialRequestRoles={initialRequestRoles}
        hasUpdateRight={hasUpdateRight}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdateMock}
      />,
    );

    const secondSwitch = screen.getAllByRole("switch")[1];
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    await user.click(secondSwitch);
    await user.click(saveButton);
    expect(screen.getByLabelText("loading")).toBeVisible();
    expect(onProjectRequestRolesUpdateMock).toHaveBeenCalledWith(
      initialRequestRoles.concat(["MAINTAINER"]),
    );
    await expect.poll(() => screen.queryByLabelText("loading")).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test("Save button enabled when update fails", async () => {
    const onProjectRequestRolesUpdateFail = () => {
      return new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject();
        }, 100);
      });
    };

    render(
      <RequestOptions
        initialRequestRoles={initialRequestRoles}
        hasUpdateRight={hasUpdateRight}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdateFail}
      />,
    );

    const firstSwitch = screen.getAllByRole("switch")[0];
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    await user.click(firstSwitch);
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);
    expect(saveButton).toBeDisabled();
    await expect.poll(() => saveButton).toBeEnabled();
  });

  test("Switches are disabled according to user right successfully", async () => {
    render(
      <RequestOptions
        initialRequestRoles={initialRequestRoles}
        hasUpdateRight={false}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
      />,
    );

    for (const needSwitch of screen.getAllByRole("switch")) {
      expect(needSwitch).toBeDisabled();
    }
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import GeneralForm from "./GeneralForm";

describe("General form", () => {
  const user = userEvent.setup();

  const name = "name";
  const alias = "alias";
  const description = "description";

  const project = {
    alias,
    assetPublic: false,
    description,
    id: "",
    license: "",
    name,
    readme: "",
    requestRoles: [],
    scope: "PRIVATE" as const,
    token: "",
  };
  const hasUpdateRight = true;
  const onProjectUpdate = () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };
  const onProjectAliasCheck = () => {
    return Promise.resolve(true);
  };

  test("Name, alias, and description are visible successfully", async () => {
    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectUpdate={onProjectUpdate}
        project={project}
      />,
    );

    expect(screen.getByLabelText("Name")).toBeVisible();
    expect(screen.getByLabelText("Name")).toHaveValue(name);
    expect(screen.getByLabelText("Alias")).toBeVisible();
    expect(screen.getByLabelText("Alias")).toHaveValue(alias);
    expect(screen.getByLabelText("Description")).toBeVisible();
    expect(screen.getByLabelText("Description")).toHaveValue(description);
  });

  test("Save button is toggled and alias check is called successfully", async () => {
    const onProjectAliasCheckMock = vi.fn(onProjectAliasCheck);

    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheckMock}
        onProjectUpdate={onProjectUpdate}
        project={project}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    const nameInput = screen.getByLabelText("Name");
    const aliasInput = screen.getByLabelText("Alias");
    const descriptionInput = screen.getByLabelText("Description");
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, "new");
    await expect.poll(() => saveButton).toBeEnabled();

    await user.clear(nameInput);
    await user.type(nameInput, name);
    await expect.poll(() => saveButton).toBeDisabled();
    await expect.poll(() => onProjectAliasCheckMock).toHaveBeenCalledTimes(0);

    await user.type(aliasInput, "new");
    await expect.poll(() => onProjectAliasCheckMock).toHaveBeenCalledTimes(1);
    await expect.poll(() => saveButton).toBeEnabled();

    await user.clear(aliasInput);
    await user.type(aliasInput, alias);
    await expect.poll(() => saveButton).toBeDisabled();
    await expect.poll(() => onProjectAliasCheckMock).toHaveBeenCalledTimes(1);

    await user.type(descriptionInput, "new");
    await expect.poll(() => saveButton).toBeEnabled();

    await user.clear(descriptionInput);
    await user.type(descriptionInput, description);
    await expect.poll(() => saveButton).toBeDisabled();
    await expect.poll(() => onProjectAliasCheckMock).toHaveBeenCalledTimes(1);
  });

  test("Update event is called successfully", async () => {
    const onProjectUpdateMock = vi.fn(onProjectUpdate);

    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectUpdate={onProjectUpdateMock}
        project={project}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save changes" });

    await user.type(screen.getByLabelText("Name"), "new");
    await user.type(screen.getByLabelText("Alias"), "new");
    await user.type(screen.getByLabelText("Description"), "new");
    await expect.poll(() => saveButton).toBeEnabled();
    await user.click(saveButton);
    expect(screen.getByLabelText("loading")).toBeVisible();
    expect(saveButton).toBeDisabled();
    expect(onProjectUpdateMock).toHaveBeenCalledWith(
      `${name}new`,
      `${alias}new`,
      `${description}new`,
    );
    await expect.poll(() => screen.queryByLabelText("loading")).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  test("Save button enabled when update fails", async () => {
    const onProjectUpdateFail = () => {
      return new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject();
        }, 100);
      });
    };

    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectUpdate={onProjectUpdateFail}
        project={project}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    await user.type(screen.getByLabelText("Name"), "new");
    await expect.poll(() => saveButton).toBeEnabled();
    await user.click(saveButton);
    expect(saveButton).toBeDisabled();
    await expect.poll(() => saveButton).toBeEnabled();
  });

  test("Validate works successfully", async () => {
    render(
      <GeneralForm
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectUpdate={onProjectUpdate}
        project={project}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    const nameInput = screen.getByLabelText("Name");
    const aliasInput = screen.getByLabelText("Alias");

    await user.clear(nameInput);
    await expect.poll(() => nameInput).toBeInvalid();
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, name);
    await expect.poll(() => nameInput).toBeValid();

    await user.clear(aliasInput);
    await expect.poll(() => aliasInput).toBeInvalid();
    expect(saveButton).toBeDisabled();

    await user.type(aliasInput, alias);
    expect(aliasInput).toBeValid();
  });

  test("All Inputs are disabled according to user right successfully", async () => {
    render(
      <GeneralForm
        hasUpdateRight={false}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectUpdate={onProjectUpdate}
        project={project}
      />,
    );

    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.getByLabelText("Alias")).toBeDisabled();
    expect(screen.getByLabelText("Description")).toBeDisabled();
  });
});

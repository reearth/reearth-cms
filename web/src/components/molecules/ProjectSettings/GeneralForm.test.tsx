import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import GeneralForm from "./GeneralForm";

describe("General form", () => {
  const user = userEvent.setup();

  const name = "name";
  const alias = "alias";
  const description = "description";

  const project = {
    id: "",
    name,
    description,
    alias,
    readme: "",
    license: "",
    scope: "PRIVATE" as const,
    assetPublic: false,
    requestRoles: [],
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
        project={project}
        hasUpdateRight={hasUpdateRight}
        onProjectUpdate={onProjectUpdate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput)).toBeVisible();
    expect(screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput)).toHaveValue(name);
    expect(screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput)).toBeVisible();
    expect(screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput)).toHaveValue(alias);
    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput),
    ).toBeVisible();
    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput),
    ).toHaveValue(description);
  });

  test("Save button is toggled and alias check is called successfully", async () => {
    const onProjectAliasCheckMock = vi.fn(onProjectAliasCheck);

    render(
      <GeneralForm
        project={project}
        hasUpdateRight={hasUpdateRight}
        onProjectUpdate={onProjectUpdate}
        onProjectAliasCheck={onProjectAliasCheckMock}
      />,
    );

    const saveButton = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);
    const nameInput = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput);
    const aliasInput = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput);
    const descriptionInput = screen.getByTestId(
      DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput,
    );
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
        project={project}
        hasUpdateRight={hasUpdateRight}
        onProjectUpdate={onProjectUpdateMock}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    const saveButton = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);

    await user.type(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput),
      "new",
    );
    await user.type(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput),
      "new",
    );
    await user.type(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput),
      "new",
    );
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
        project={project}
        hasUpdateRight={hasUpdateRight}
        onProjectUpdate={onProjectUpdateFail}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    const saveButton = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);
    await user.type(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput),
      "new",
    );
    await expect.poll(() => saveButton).toBeEnabled();
    await user.click(saveButton);
    expect(saveButton).toBeDisabled();
    await expect.poll(() => saveButton).toBeEnabled();
  });

  test("Validate works successfully", async () => {
    render(
      <GeneralForm
        project={project}
        hasUpdateRight={hasUpdateRight}
        onProjectUpdate={onProjectUpdate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    const saveButton = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__SaveButton);
    const nameInput = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput);
    const aliasInput = screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput);

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
        project={project}
        hasUpdateRight={false}
        onProjectUpdate={onProjectUpdate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__NameInput)).toBeDisabled();
    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__AliasInput),
    ).toBeDisabled();
    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__GeneralForm__DescriptionInput),
    ).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";

import ProjectSettings from ".";

describe("Project settings", () => {
  const name = "name";

  const project = {
    id: "",
    name,
    description: "",
    alias: "",
    scope: "PRIVATE" as const,
    assetPublic: false,
    requestRoles: [],
    token: "",
  };
  const hasUpdateRight = true;
  const hasDeleteRight = true;
  const onProjectDelete = () => {
    return Promise.resolve();
  };
  const onProjectUpdate = () => {
    return Promise.resolve();
  };
  const onProjectRequestRolesUpdate = () => {
    return Promise.resolve();
  };
  const onProjectAliasCheck = () => {
    return Promise.resolve(true);
  };

  test("Project name is visible on title successfully", async () => {
    render(
      <ProjectSettings
        project={project}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        onProjectDelete={onProjectDelete}
        onProjectUpdate={onProjectUpdate}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByRole("heading", { name: `Project Settings / ${name}` })).toBeVisible();
  });

  test("Sections are visible successfully", async () => {
    render(
      <ProjectSettings
        project={project}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        onProjectDelete={onProjectDelete}
        onProjectUpdate={onProjectUpdate}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByText("General")).toBeVisible();
    expect(screen.getByText("Request")).toBeVisible();
    expect(screen.getByText("Danger Zone")).toBeVisible();
  });

  test("Loading is visible successfully", async () => {
    render(
      <ProjectSettings
        project={undefined}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        onProjectDelete={onProjectDelete}
        onProjectUpdate={onProjectUpdate}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
  });
});

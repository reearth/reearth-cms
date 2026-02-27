import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ProjectSettings from ".";

describe("Project settings", () => {
  const name = "name";

  const project = {
    alias: "",
    assetPublic: false,
    description: "",
    id: "",
    license: "",
    name,
    readme: "",
    requestRoles: [],
    scope: "PRIVATE" as const,
    token: "",
  };
  const hasPublishRight = true;
  const hasUpdateRight = true;
  const hasDeleteRight = true;
  const onProjectVisibilityChange = (_: string) => {
    return Promise.resolve();
  };
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
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectDelete={onProjectDelete}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        onProjectUpdate={onProjectUpdate}
        onProjectVisibilityChange={onProjectVisibilityChange}
        project={project}
      />,
    );

    expect(screen.getByRole("heading", { name: `Project Settings / ${name}` })).toBeVisible();
  });

  test("Sections are visible successfully", async () => {
    render(
      <ProjectSettings
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectDelete={onProjectDelete}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        onProjectUpdate={onProjectUpdate}
        onProjectVisibilityChange={onProjectVisibilityChange}
        project={project}
      />,
    );

    expect(screen.getByText("General")).toBeVisible();
    expect(screen.getByText("Request")).toBeVisible();
    expect(screen.getByText("Danger Zone")).toBeVisible();
  });

  test("Loading is visible successfully", async () => {
    render(
      <ProjectSettings
        hasDeleteRight={hasDeleteRight}
        hasPublishRight={hasPublishRight}
        hasUpdateRight={hasUpdateRight}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectDelete={onProjectDelete}
        onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        onProjectUpdate={onProjectUpdate}
        onProjectVisibilityChange={onProjectVisibilityChange}
        project={undefined}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
  });
});

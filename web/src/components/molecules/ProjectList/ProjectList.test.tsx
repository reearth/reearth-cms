import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Project } from "@reearth-cms/components/molecules/Workspace/types";

import ProjectList from "./ProjectList";

describe("Project list", () => {
  const hasCreateRight = true;
  const projects: Project[] = [];
  const loading = false;
  const page = 1;
  const pageSize = 10;
  const totalCount = 0;

  const onProjectNavigation = () => {
    return Promise.resolve();
  };
  const onProjectCreate = () => {
    return Promise.resolve();
  };
  const onProjectAliasCheck = () => {
    return Promise.resolve(true);
  };

  const onPageChange = () => {
    return Promise.resolve();
  };

  test("Loading displays successfully", () => {
    render(
      <ProjectList
        hasCreateRight={hasCreateRight}
        loading={true}
        onPageChange={onPageChange}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectCreate={onProjectCreate}
        onProjectNavigation={onProjectNavigation}
        page={page}
        pageSize={pageSize}
        projects={projects}
        totalCount={totalCount}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
  });

  test("Creating button and document link displays successfully", () => {
    render(
      <ProjectList
        hasCreateRight={hasCreateRight}
        loading={loading}
        onPageChange={onPageChange}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectCreate={onProjectCreate}
        onProjectNavigation={onProjectNavigation}
        page={page}
        pageSize={pageSize}
        projects={projects}
        totalCount={totalCount}
      />,
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
    expect(screen.getByRole("link")).toBeVisible();
  });

  test("Creating button is disabled due to user right", () => {
    render(
      <ProjectList
        hasCreateRight={false}
        loading={loading}
        onPageChange={onPageChange}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectCreate={onProjectCreate}
        onProjectNavigation={onProjectNavigation}
        page={page}
        pageSize={pageSize}
        projects={projects}
        totalCount={totalCount}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });

  test("Project cards display successfully", () => {
    const name = "name";
    const description = "description";
    const testProjects = [
      {
        description,
        id: "id1",
        name,
      },
      {
        description,
        id: "id2",
        name,
      },
    ];

    render(
      <ProjectList
        hasCreateRight={hasCreateRight}
        loading={loading}
        onPageChange={onPageChange}
        onProjectAliasCheck={onProjectAliasCheck}
        onProjectCreate={onProjectCreate}
        onProjectNavigation={onProjectNavigation}
        page={page}
        pageSize={pageSize}
        projects={testProjects}
        totalCount={totalCount}
      />,
    );

    expect(screen.getAllByText(name).length).toBe(testProjects.length);
  });
});

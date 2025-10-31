import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";

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
        projects={projects}
        loading={true}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onProjectNavigation={onProjectNavigation}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByTestId("loading")).toBeVisible();
  });

  test("Creating button and document link displays successfully", () => {
    render(
      <ProjectList
        hasCreateRight={hasCreateRight}
        projects={projects}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onProjectNavigation={onProjectNavigation}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
    expect(screen.getByRole("link")).toBeVisible();
  });

  test("Creating button is disabled due to user right", () => {
    render(
      <ProjectList
        hasCreateRight={false}
        projects={projects}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onProjectNavigation={onProjectNavigation}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });

  test("Project cards display successfully", () => {
    const name = "name";
    const description = "description";
    const testProjects = [
      {
        id: "id1",
        name,
        description,
      },
      {
        id: "id2",
        name,
        description,
      },
    ];

    render(
      <ProjectList
        hasCreateRight={hasCreateRight}
        projects={testProjects}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onProjectNavigation={onProjectNavigation}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getAllByText(name).length).toBe(testProjects.length);
  });
});

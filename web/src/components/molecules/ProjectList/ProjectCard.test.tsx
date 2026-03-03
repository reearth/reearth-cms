import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import ProjectCard from "./ProjectCard";

test("Project card displays successfully", () => {
  const name = "name";
  const description = "description";
  const project = {
    description,
    id: "id",
    name,
  };
  const onProjectNavigation = () => {
    return Promise.resolve();
  };

  render(<ProjectCard onProjectNavigation={onProjectNavigation} project={project} />);

  expect(screen.getByText(name)).toBeInTheDocument();
  expect(screen.getByText(description)).toBeInTheDocument();
});

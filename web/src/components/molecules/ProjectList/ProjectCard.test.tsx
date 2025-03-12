import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import ProjectCard from "./ProjectCard";

test("Project card displays successfully", () => {
  const name = "name";
  const description = "description";
  const project = {
    id: "id",
    name,
    description,
  };
  const onProjectNavigation = () => {
    return Promise.resolve();
  };

  render(<ProjectCard project={project} onProjectNavigation={onProjectNavigation} />);

  expect(screen.getByText(name.charAt(0))).toBeInTheDocument();
  expect(screen.getByText(name)).toBeInTheDocument();
  expect(screen.getByText(description)).toBeInTheDocument();
});

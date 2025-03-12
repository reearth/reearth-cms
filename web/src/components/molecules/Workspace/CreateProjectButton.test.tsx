import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe } from "vitest";

import CreateProjectButton from "./CreateProjectButton";

describe("Create project button", () => {
  const user = userEvent.setup();

  const onProjectCreate = () => {
    return Promise.resolve();
  };
  const onProjectAliasCheck = () => {
    return Promise.resolve(true);
  };

  test("Modal works successfully", async () => {
    render(
      <CreateProjectButton
        hasCreateRight={true}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("Creating button is disabled due to user right", () => {
    render(
      <CreateProjectButton
        hasCreateRight={false}
        onProjectCreate={onProjectCreate}
        onProjectAliasCheck={onProjectAliasCheck}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });
});

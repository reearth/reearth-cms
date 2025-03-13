import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import DangerZone from "./DangerZone";

test("Danger zone works successfully", async () => {
  const user = userEvent.setup();

  const onUserDelete = () => {
    return Promise.resolve();
  };

  render(<DangerZone onUserDelete={onUserDelete} />);

  await user.click(screen.getByRole("button"));
  await expect.poll(() => screen.getByRole("dialog")).toBeVisible();
});

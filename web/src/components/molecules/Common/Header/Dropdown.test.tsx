import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import Dropdown from "./Dropdown";

test("opens and renders the wrapped menu content", async () => {
  const user = userEvent.setup();

  render(
    <Dropdown
      items={[{ key: "profile", label: "Profile" }]}
      name="Jane"
      personal
      showName
      showArrow
    />,
  );

  await user.click(screen.getByText("Jane"));

  expect(await screen.findByText("Profile")).toBeInTheDocument();
});

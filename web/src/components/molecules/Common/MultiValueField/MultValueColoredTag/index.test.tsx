import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { expect, test, vi } from "vitest";

import MultiValueColoredTag from ".";
import type { Props } from ".";

test("clicking a tag focuses its input via the ref callback", async () => {
  const user = userEvent.setup();

  const props: Props = {
    value: [
      { id: "1", name: "Tag A", color: "BLUE" },
      { id: "2", name: "Tag B", color: "RED" },
    ],
    onChange: vi.fn(),
    errorIndexes: new Set<number>(),
  } as unknown as ComponentProps<typeof MultiValueColoredTag>;

  render(<MultiValueColoredTag {...props} />);

  await user.click(screen.getByText("Tag A"));
  expect(screen.getByDisplayValue("Tag A")).toHaveFocus();

  await user.click(screen.getByText("Tag B"));
  expect(screen.getByDisplayValue("Tag B")).toHaveFocus();
});

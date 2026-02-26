import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import DangerZone from "./DangerZone";

describe("DangerZone", () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  test("Danger zone works successfully", async () => {
    const onUserDelete = () => {
      return Promise.resolve();
    };

    render(<DangerZone onUserDelete={onUserDelete} />);

    await user.click(screen.getByRole("button"));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();
  });

  test("Confirming deletion dialog calls onUserDelete", async () => {
    const onUserDeleteMock = vi.fn(() => Promise.resolve());

    render(<DangerZone onUserDelete={onUserDeleteMock} />);

    await user.click(screen.getByRole("button", { name: "Delete Personal Account" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "OK" }),
    );
    expect(onUserDeleteMock).toHaveBeenCalledOnce();
  });

  test("Cancelling deletion dialog does not call onUserDelete", async () => {
    const onUserDeleteMock = vi.fn(() => Promise.resolve());

    render(<DangerZone onUserDelete={onUserDeleteMock} />);

    await user.click(screen.getByRole("button", { name: "Delete Personal Account" }));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }),
    );
    expect(onUserDeleteMock).not.toHaveBeenCalled();
  });
});

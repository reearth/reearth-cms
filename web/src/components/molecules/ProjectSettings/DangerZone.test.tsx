import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import DangerZone from "./DangerZone";

describe("DangerZone", () => {
  const user = userEvent.setup();

  const defaultProps = {
    projectName: "TestProject",
    visibility: "PRIVATE" as const,
    hasDeleteRight: true,
    hasPublishRight: true,
    onProjectDelete: vi.fn(() => Promise.resolve()),
    onProjectVisibilityChange: vi.fn(() => Promise.resolve()),
  };

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  // Group 1 — Rendering

  test("renders section titles", () => {
    render(<DangerZone {...defaultProps} />);

    expect(screen.getByText("Change project visibility")).toBeVisible();
    expect(screen.getByText("Delete project", { selector: "h1" })).toBeVisible();
  });

  test("renders delete button with correct data-testid", () => {
    render(<DangerZone {...defaultProps} />);

    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton),
    ).toBeVisible();
  });

  test("renders visibility select reflecting initial value", () => {
    const { unmount } = render(<DangerZone {...defaultProps} visibility="PRIVATE" />);
    expect(screen.getByTitle("Private")).toBeVisible();

    unmount();
    document.body.innerHTML = "";

    render(<DangerZone {...defaultProps} visibility="PUBLIC" />);
    expect(screen.getByTitle("Public")).toBeVisible();
  });

  // Group 2 — Permission-based disabled states

  test("delete button is disabled when hasDeleteRight is false", () => {
    render(<DangerZone {...defaultProps} hasDeleteRight={false} />);

    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton),
    ).toBeDisabled();
  });

  test("visibility select is disabled when hasPublishRight is false", () => {
    render(<DangerZone {...defaultProps} hasPublishRight={false} />);

    expect(screen.getByRole("combobox")).toHaveAttribute("disabled");
  });

  // Group 3 — Delete project flow

  test("clicking delete button opens confirmation modal", async () => {
    render(<DangerZone {...defaultProps} />);

    await user.click(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton),
    );
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/TestProject/)).toBeVisible();
  });

  test("confirming delete calls onProjectDelete", async () => {
    const onProjectDelete = vi.fn(() => Promise.resolve());
    render(<DangerZone {...defaultProps} onProjectDelete={onProjectDelete} />);

    await user.click(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton),
    );
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__ConfirmDeleteProjectButton),
    );
    expect(onProjectDelete).toHaveBeenCalledOnce();
  });

  test("cancelling delete does not call onProjectDelete", async () => {
    const onProjectDelete = vi.fn(() => Promise.resolve());
    render(<DangerZone {...defaultProps} onProjectDelete={onProjectDelete} />);

    await user.click(
      screen.getByTestId(DATA_TEST_ID.ProjectSettings__DangerZone__DeleteProjectButton),
    );
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }),
    );
    expect(onProjectDelete).not.toHaveBeenCalled();
  });

  // Group 4 — Visibility change flow

  test("selecting PUBLIC opens modal with public warning", async () => {
    render(<DangerZone {...defaultProps} visibility="PRIVATE" />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByTitle("Public"));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Are you sure you want to set this project to public?"),
    ).toBeVisible();
  });

  test("confirming visibility change calls callback with PUBLIC", async () => {
    const onProjectVisibilityChange = vi.fn(() => Promise.resolve());
    render(
      <DangerZone
        {...defaultProps}
        visibility="PRIVATE"
        onProjectVisibilityChange={onProjectVisibilityChange}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByTitle("Public"));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "OK" }),
    );
    expect(onProjectVisibilityChange).toHaveBeenCalledWith("PUBLIC");
  });

  test("cancelling visibility change does not call callback", async () => {
    const onProjectVisibilityChange = vi.fn(() => Promise.resolve());
    render(
      <DangerZone
        {...defaultProps}
        visibility="PRIVATE"
        onProjectVisibilityChange={onProjectVisibilityChange}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByTitle("Public"));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }),
    );
    expect(onProjectVisibilityChange).not.toHaveBeenCalled();
  });

  test("selecting PRIVATE shows private-specific modal text", async () => {
    render(<DangerZone {...defaultProps} visibility="PUBLIC" />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByTitle("Private"));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Are you sure you want to set this project to private?"),
    ).toBeVisible();
  });

  test("confirming visibility change to PRIVATE calls callback with PRIVATE", async () => {
    const onProjectVisibilityChange = vi.fn(() => Promise.resolve());
    render(
      <DangerZone
        {...defaultProps}
        visibility="PUBLIC"
        onProjectVisibilityChange={onProjectVisibilityChange}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByTitle("Private"));
    await expect.poll(() => screen.getByRole("dialog")).toBeVisible();

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "OK" }),
    );
    expect(onProjectVisibilityChange).toHaveBeenCalledWith("PRIVATE");
  });
});

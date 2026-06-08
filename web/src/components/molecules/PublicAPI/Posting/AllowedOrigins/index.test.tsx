import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import Notification from "@reearth-cms/components/atoms/Notification";
import { t } from "@reearth-cms/i18n";

import AllowedOrigins from ".";

describe("AllowedOrigins", () => {
  const user = userEvent.setup();

  const renderComponent = (props?: Partial<React.ComponentProps<typeof AllowedOrigins>>) => {
    const onChange = vi.fn();
    const utils = render(
      <AllowedOrigins origins={[]} onChange={onChange} {...props} />,
    );
    return { onChange, ...utils };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows the configured count for the current origins", () => {
    renderComponent({ origins: ["a.com", "b.com"] });
    expect(screen.getByText(/2 configured/)).toBeVisible();
  });

  test("appends a valid domain", async () => {
    const { onChange } = renderComponent({ origins: [] });
    await user.type(screen.getByRole("combobox"), "example.com,");
    expect(onChange).toHaveBeenCalledWith(["example.com"]);
  });

  test("rejects an invalid domain with a warning and does not change origins", async () => {
    const warning = vi.spyOn(Notification, "warning").mockImplementation(() => ({}) as never);
    const { onChange } = renderComponent({ origins: [] });
    await user.type(screen.getByRole("combobox"), "invalid,");
    expect(warning).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  test("clears all origins, and the clear button is disabled when empty", async () => {
    const { onChange, rerender } = renderComponent({
      origins: ["a.com"],
      onSubmit: vi.fn(),
    });
    await user.click(screen.getByRole("button", { name: t("Clear all") }));
    expect(onChange).toHaveBeenCalledWith([]);

    rerender(<AllowedOrigins origins={[]} onChange={onChange} onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: t("Clear all") })).toBeDisabled();
  });

  test("save button reflects changed/unchanged state and the presence of onSubmit", () => {
    const { rerender } = renderComponent({
      origins: ["a.com"],
      savedOrigins: ["a.com"],
      onSubmit: vi.fn(),
    });
    const saveButton = () => screen.getByRole("button", { name: t("Save changes") });
    // unchanged → disabled
    expect(saveButton()).toBeDisabled();

    // changed → enabled
    rerender(
      <AllowedOrigins
        origins={["a.com", "b.com"]}
        savedOrigins={["a.com"]}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(saveButton()).toBeEnabled();

    // changed but no onSubmit → disabled
    rerender(<AllowedOrigins origins={["a.com", "b.com"]} savedOrigins={["a.com"]} onChange={vi.fn()} />);
    expect(saveButton()).toBeDisabled();
  });

  test("submits the origins and notifies on success", async () => {
    const success = vi.spyOn(Notification, "success").mockImplementation(() => ({}) as never);
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderComponent({ origins: ["a.com"], savedOrigins: [], onSubmit });

    await user.click(screen.getByRole("button", { name: t("Save changes") }));
    expect(onSubmit).toHaveBeenCalledWith(["a.com"]);
    await waitFor(() => expect(success).toHaveBeenCalled());
  });

  test("rolls back to the saved origins and notifies on submit failure", async () => {
    const error = vi.spyOn(Notification, "error").mockImplementation(() => ({}) as never);
    const onSubmit = vi.fn().mockRejectedValue(new Error("nope"));
    const { onChange } = renderComponent({
      origins: ["a.com"],
      savedOrigins: [],
      onSubmit,
    });

    await user.click(screen.getByRole("button", { name: t("Save changes") }));
    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

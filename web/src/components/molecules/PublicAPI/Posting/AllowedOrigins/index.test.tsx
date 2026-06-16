import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import Notification from "@reearth-cms/components/atoms/Notification";
import { t } from "@reearth-cms/i18n";

import AllowedOrigins from ".";

describe("AllowedOrigins", () => {
  const user = userEvent.setup();

  const renderComponent = (props?: Partial<React.ComponentProps<typeof AllowedOrigins>>) => {
    const onChange = vi.fn();
    const utils = render(<AllowedOrigins origins={[]} onChange={onChange} {...props} />);
    return { onChange, ...utils };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows the configured count for the current origins", () => {
    renderComponent({ origins: ["a.com", "b.com"] });
    expect(screen.getByText(/2 configured/)).toBeVisible();
  });

  test("appends a valid origin", async () => {
    const { onChange } = renderComponent({ origins: [] });
    await user.type(screen.getByRole("combobox"), "https://example.com,");
    expect(onChange).toHaveBeenCalledWith(["https://example.com"]);
  });

  test("rejects an invalid origin with a warning and does not change origins", async () => {
    const warning = vi.spyOn(Notification, "warning").mockImplementation(() => ({}) as never);
    const { onChange } = renderComponent({ origins: [] });
    await user.type(screen.getByRole("combobox"), "example.com,");
    expect(warning).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  test("clears all origins, and the clear button is disabled when empty", async () => {
    const { onChange, rerender } = renderComponent({ origins: ["a.com"] });
    await user.click(screen.getByRole("button", { name: t("Clear all") }));
    expect(onChange).toHaveBeenCalledWith([]);

    rerender(<AllowedOrigins origins={[]} onChange={onChange} />);
    expect(screen.getByRole("button", { name: t("Clear all") })).toBeDisabled();
  });
});

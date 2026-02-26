import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { localesWithLabel } from "@reearth-cms/i18n";

import ServiceForm from "./ServiceForm";

describe("ServiceForm", () => {
  const user = userEvent.setup();

  const lang = "en";
  const initialValues = { lang };

  test("Service form works successfully", async () => {
    const onLanguageUpdate = () => {
      return Promise.resolve();
    };

    render(<ServiceForm initialValues={initialValues} onLanguageUpdate={onLanguageUpdate} />);

    const langSelect = screen.getByLabelText("Service Language");
    const saveButton = screen.getByRole("button", { name: "Save" });

    expect(screen.getByText(localesWithLabel[lang])).toBeVisible();
    expect(saveButton).toHaveAttribute("disabled");

    await user.click(langSelect);
    await expect.poll(() => screen.getByText("Auto")).toBeVisible();
    expect(screen.getAllByText(localesWithLabel.en).length).toBe(2);
    expect(screen.getByText(localesWithLabel.ja)).toBeVisible();
    await user.click(screen.getByText(localesWithLabel.ja));
    expect(saveButton).not.toHaveAttribute("disabled");

    await user.click(saveButton);
    expect(saveButton).toHaveAttribute("disabled");
  });

  test("Save calls onLanguageUpdate with correct language", async () => {
    const onLanguageUpdateMock = vi.fn(() => Promise.resolve());

    render(<ServiceForm initialValues={initialValues} onLanguageUpdate={onLanguageUpdateMock} />);

    const langSelect = screen.getByLabelText("Service Language");
    const saveButton = screen.getByRole("button", { name: "Save" });

    await user.click(langSelect);
    await expect.poll(() => screen.getByText(localesWithLabel.ja)).toBeVisible();
    await user.click(screen.getByText(localesWithLabel.ja));
    await user.click(saveButton);

    expect(onLanguageUpdateMock).toHaveBeenCalledWith("ja");
  });

  test("Save button re-enables when onLanguageUpdate rejects", async () => {
    const onLanguageUpdateMock = vi.fn(() => Promise.reject());

    render(<ServiceForm initialValues={initialValues} onLanguageUpdate={onLanguageUpdateMock} />);

    const langSelect = screen.getByLabelText("Service Language");
    const saveButton = screen.getByRole("button", { name: "Save" });

    await user.click(langSelect);
    await expect.poll(() => screen.getByText(localesWithLabel.ja)).toBeVisible();
    await user.click(screen.getByText(localesWithLabel.ja));
    await user.click(saveButton);

    await expect.poll(() => saveButton).not.toHaveAttribute("disabled");
  });

  test("Save button re-disables when original language re-selected", async () => {
    const onLanguageUpdate = () => Promise.resolve();

    render(<ServiceForm initialValues={initialValues} onLanguageUpdate={onLanguageUpdate} />);

    const langSelect = screen.getByLabelText("Service Language");
    const saveButton = screen.getByRole("button", { name: "Save" });

    await user.click(langSelect);
    await expect.poll(() => screen.getByText(localesWithLabel.ja)).toBeVisible();
    await user.click(screen.getByText(localesWithLabel.ja));
    expect(saveButton).not.toHaveAttribute("disabled");

    await user.click(langSelect);
    await expect.poll(() => screen.getByText(localesWithLabel.en)).toBeVisible();
    await user.click(screen.getByText(localesWithLabel.en));
    expect(saveButton).toHaveAttribute("disabled");
  });
});

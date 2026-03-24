import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { localesWithLabel } from "@reearth-cms/i18n";

import ServiceForm from "./ServiceForm";

test("Service form works successfully", async () => {
  const user = userEvent.setup();

  const lang = "en";
  const initialValues = { lang };
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

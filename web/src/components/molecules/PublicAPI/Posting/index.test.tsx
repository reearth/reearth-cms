import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { t } from "@reearth-cms/i18n";

import { FormType } from "../types";

import PostingTab from ".";

describe("PostingTab", () => {
  const user = userEvent.setup();

  const apiUrl = "https://test.com/api/";
  const models = [{ id: "m1", name: "Model One", key: "model1" }];
  const initialValues: FormType = { assetPublic: false, models: { m1: false } };
  const ORIGIN_WARNING = "Please add at least one origin to enable Post API";

  const renderTab = ({ hasPostingRight = true }: { hasPostingRight?: boolean } = {}) =>
    render(
      <PostingTab
        apiUrl={apiUrl}
        initialValues={initialValues}
        isPublic={false}
        hasPublishRight
        hasPostingRight={hasPostingRight}
        models={models}
        updateLoading={false}
      />,
    );

  test("starts with no origins: warning shown and table disabled", () => {
    renderTab();
    expect(screen.getByText(/0 configured/)).toBeVisible();
    expect(screen.getByText(ORIGIN_WARNING)).toBeVisible();
    screen.getAllByRole("switch").forEach(s => expect(s).toBeDisabled());
  });

  test("adding an origin hides the warning and enables the table, clearing restores it", async () => {
    renderTab();

    await user.type(screen.getByRole("combobox"), "example.com,");
    expect(screen.getByText(/1 configured/)).toBeVisible();
    expect(screen.queryByText(ORIGIN_WARNING)).not.toBeInTheDocument();
    screen.getAllByRole("switch").forEach(s => expect(s).toBeEnabled());

    await user.click(screen.getByRole("button", { name: t("Clear all") }));
    expect(screen.getByText(/0 configured/)).toBeVisible();
    expect(screen.getByText(ORIGIN_WARNING)).toBeVisible();
    screen.getAllByRole("switch").forEach(s => expect(s).toBeDisabled());
  });

  test("Save changes is disabled until origins or a model toggle change", async () => {
    renderTab();
    const saveButton = () => screen.getByRole("button", { name: t("Save changes") });

    // nothing changed yet → disabled
    expect(saveButton()).toBeDisabled();

    // adding an origin is a change → enabled
    await user.type(screen.getByRole("combobox"), "example.com,");
    expect(saveButton()).toBeEnabled();
  });

  test("without posting permission: shows warning and hides the editor", () => {
    renderTab({ hasPostingRight: false });

    expect(screen.getByText(t("Not enough permissions"))).toBeVisible();
    expect(
      screen.getByText(t("Only Maintainer role or above can change the settings of the Post API")),
    ).toBeVisible();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(/configured/)).not.toBeInTheDocument();
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
  });
});

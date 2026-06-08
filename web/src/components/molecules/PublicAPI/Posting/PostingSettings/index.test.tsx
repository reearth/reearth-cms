import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { t } from "@reearth-cms/i18n";

import { FormType } from "../../types";

import PostingSettings from ".";

describe("PostingSettings", () => {
  const apiUrl = "https://test.com/api/";
  const models = [{ id: "m1", name: "Model One", key: "model1" }];
  const initialValues: FormType = { assetPublic: false, models: { m1: false } };
  const ORIGIN_WARNING = "Please add at least one origin to enable Post API";

  const renderSettings = (props?: Partial<React.ComponentProps<typeof PostingSettings>>) =>
    render(
      <PostingSettings
        apiUrl={apiUrl}
        initialValues={initialValues}
        hasPublishRight
        models={models}
        updateLoading={false}
        {...props}
      />,
    );

  test("warns and disables the table when there are no origins", () => {
    renderSettings({ origins: [] });
    expect(screen.getByText(ORIGIN_WARNING)).toBeVisible();
    screen.getAllByRole("switch").forEach(s => expect(s).toBeDisabled());
  });

  test("hides the warning and enables the table when origins exist", () => {
    renderSettings({ origins: ["a.com"] });
    expect(screen.queryByText(ORIGIN_WARNING)).not.toBeInTheDocument();
    screen.getAllByRole("switch").forEach(s => expect(s).toBeEnabled());
  });

  test("renders the save button only when not public", () => {
    const { rerender } = renderSettings({ origins: ["a.com"], isPublic: false });
    expect(screen.getByRole("button", { name: t("Save changes") })).toBeInTheDocument();

    rerender(
      <PostingSettings
        apiUrl={apiUrl}
        initialValues={initialValues}
        hasPublishRight
        models={models}
        updateLoading={false}
        origins={["a.com"]}
        isPublic
      />,
    );
    expect(screen.queryByRole("button", { name: t("Save changes") })).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";

import PostingSettings from ".";

describe("PostingSettings", () => {
  const apiUrl = "https://test.com/api/";
  const models = [{ id: "m1", name: "Model One", key: "model1" }];
  const ORIGIN_WARNING = "Please add at least one origin to enable Post API";

  // PostingTable's Form.Item switches need an ancestor Form (provided by PostingTab in the app).
  const renderSettings = (props?: Partial<React.ComponentProps<typeof PostingSettings>>) =>
    render(
      <Form>
        <PostingSettings apiUrl={apiUrl} hasPublishRight models={models} {...props} />
      </Form>,
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
});

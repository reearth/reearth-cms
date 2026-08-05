import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import { t } from "@reearth-cms/i18n";

import PostingTable from "./PostingTable";

describe("PostingTable", () => {
  const apiUrl = "https://test.com/api/";
  const models = [{ id: "m1", name: "Model One", key: "model1" }];

  const renderTable = (props?: Partial<React.ComponentProps<typeof PostingTable>>) =>
    render(
      <Form>
        <PostingTable apiUrl={apiUrl} hasPublishRight models={models} {...props} />
      </Form>,
    );

  test("renders model rows with their endpoints (assets excluded)", () => {
    renderTable();
    expect(screen.getByText("Model One")).toBeVisible();
    expect(screen.getByText(`${apiUrl}model1`)).toBeVisible();
    // Assets are intentionally excluded from the Posting table (see PostingTable TODO).
    expect(screen.queryByText(t("Assets"))).not.toBeInTheDocument();
    expect(screen.queryByText(`${apiUrl}assets`)).not.toBeInTheDocument();
  });

  test("disables the switches and greys out the table when disabled", () => {
    const { container } = renderTable({ disabled: true });
    screen.getAllByRole("switch").forEach(s => expect(s).toBeDisabled());
    const wrapper = container.querySelector("form")?.firstElementChild;
    expect(wrapper).toHaveStyleRule("pointer-events", "none");
    expect(wrapper).toHaveStyleRule("opacity", "0.6");
  });

  test("keeps the table interactive when not disabled", () => {
    const { container } = renderTable({ disabled: false });
    screen.getAllByRole("switch").forEach(s => expect(s).toBeEnabled());
    const wrapper = container.querySelector("form")?.firstElementChild;
    expect(wrapper).toHaveStyleRule("pointer-events", "auto");
    expect(wrapper).toHaveStyleRule("opacity", "1");
  });
});

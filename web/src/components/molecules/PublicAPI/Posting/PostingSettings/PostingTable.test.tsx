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

  test("renders model and asset rows with their endpoints", () => {
    renderTable();
    expect(screen.getByText("Model One")).toBeVisible();
    expect(screen.getByText(`${apiUrl}model1`)).toBeVisible();
    expect(screen.getByText(t("Assets"))).toBeVisible();
    expect(screen.getByText(`${apiUrl}assets`)).toBeVisible();
  });

  test("shows the enable column with switches when not public", () => {
    renderTable({ isPublic: false });
    expect(screen.getByText(t("POST API Enable"))).toBeVisible();
    expect(screen.getAllByRole("switch")).toHaveLength(models.length + 1); // models + assets
  });

  test("hides the enable column and switches when public", () => {
    renderTable({ isPublic: true });
    expect(screen.queryByText(t("POST API Enable"))).not.toBeInTheDocument();
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
  });

  test("disables the switches and greys out the table when disabled", () => {
    const { container } = renderTable({ isPublic: false, disabled: true });
    screen.getAllByRole("switch").forEach(s => expect(s).toBeDisabled());
    const wrapper = container.querySelector("form")?.firstElementChild;
    expect(wrapper).toHaveStyleRule("pointer-events", "none");
    expect(wrapper).toHaveStyleRule("opacity", "0.6");
  });

  test("keeps the table interactive when not disabled", () => {
    const { container } = renderTable({ isPublic: false, disabled: false });
    screen.getAllByRole("switch").forEach(s => expect(s).toBeEnabled());
    const wrapper = container.querySelector("form")?.firstElementChild;
    expect(wrapper).toHaveStyleRule("pointer-events", "auto");
    expect(wrapper).toHaveStyleRule("opacity", "1");
  });
});

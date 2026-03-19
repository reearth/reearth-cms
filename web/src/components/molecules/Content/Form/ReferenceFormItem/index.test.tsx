import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";

import type { FormItem } from "@reearth-cms/components/molecules/Content/types";

import ReferenceFormItem from ".";

vi.mock("@reearth-cms/components/molecules/Content/LinkItemModal", () => ({
  default: ({ visible }: { visible: boolean }) =>
    visible ? <div data-testid="mock-link-item-modal">LinkItemModal</div> : null,
}));

vi.mock("@reearth-cms/components/molecules/Content/ReferenceItem", () => ({
  default: ({ value, title }: { value: string; title: string }) => (
    <div data-testid="mock-reference-item">{`${value}: ${title}`}</div>
  ),
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={["/workspaces/ws-1/projects/proj-1"]}>
      <Routes>
        <Route path="/workspaces/:workspaceId/projects/:projectId" element={ui} />
      </Routes>
    </MemoryRouter>,
  );

const baseProps = () => ({
  fieldId: "field-1",
  referencedItems: [] as FormItem[],
});

describe("ReferenceFormItem", () => {
  test("renders 'Refer to item' button when no value", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} />);
    expect(screen.getByRole("button", { name: /Refer to item/ })).toBeVisible();
  });

  test("renders 'Replace item' button when value is set", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} value="item-1" />);
    expect(screen.getByRole("button", { name: /Replace item/ })).toBeVisible();
  });

  test("hides buttons when disabled", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} disabled={true} />);
    expect(screen.queryByRole("button", { name: /Refer to item/ })).not.toBeInTheDocument();
  });

  test("renders ReferenceItem when value is set", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} value="item-1" />);
    expect(screen.getByTestId("mock-reference-item")).toBeVisible();
  });

  test("does not render ReferenceItem when value is empty", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} />);
    expect(screen.queryByTestId("mock-reference-item")).not.toBeInTheDocument();
  });

  test("hides unreference button when disabled", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} value="item-1" disabled={true} />);
    // ReferenceItem should be present but no unreference button
    expect(screen.getByTestId("mock-reference-item")).toBeVisible();
    // The unreference button has an arrowUpRightSlash icon - no buttons should be present
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("calls onChange when unreference button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithRouter(<ReferenceFormItem {...baseProps()} value="item-1" onChange={onChange} />);
    // The unreference button is the second button (first is Replace item)
    const buttons = screen.getAllByRole("button");
    // Find the unreference button (it doesn't have text, just an icon)
    const unreferButton = buttons.find(btn => !btn.textContent?.includes("Replace item"));
    expect(unreferButton).toBeDefined();
    if (!unreferButton) return;
    await user.click(unreferButton);
    expect(onChange).toHaveBeenCalledWith();
  });

  test("opens modal on Refer button click when onReferenceModelUpdate is provided", async () => {
    const user = userEvent.setup();
    const onReferenceModelUpdate = vi.fn();
    renderWithRouter(
      <ReferenceFormItem
        {...baseProps()}
        modelId="model-1"
        onReferenceModelUpdate={onReferenceModelUpdate}
        onSearchTerm={vi.fn()}
        onLinkItemTableReload={vi.fn()}
        onLinkItemTableChange={vi.fn()}
        onCheckItemReference={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Refer to item/ }));
    expect(onReferenceModelUpdate).toHaveBeenCalledWith("model-1", "");
    expect(screen.getByTestId("mock-link-item-modal")).toBeVisible();
  });

  test("modal is absent when required callbacks are missing", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} />);
    expect(screen.queryByTestId("mock-link-item-modal")).not.toBeInTheDocument();
  });

  test("resolves currentItem from referencedItems", () => {
    const referencedItems: FormItem[] = [
      {
        id: "item-1",
        title: "Found Item",
        schemaId: "s1",
        createdBy: "user-1",
        status: "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    renderWithRouter(
      <ReferenceFormItem fieldId="field-1" referencedItems={referencedItems} value="item-1" />,
    );
    expect(screen.getByTestId("mock-reference-item")).toHaveTextContent("item-1: Found Item");
  });

  test("shows empty title when value does not match any referencedItem", () => {
    renderWithRouter(<ReferenceFormItem {...baseProps()} value="nonexistent" />);
    expect(screen.getByTestId("mock-reference-item")).toHaveTextContent("nonexistent:");
  });
});

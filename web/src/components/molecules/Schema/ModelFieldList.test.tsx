import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import type { Field } from "./types";

import ModelFieldList from "./ModelFieldList";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Text",
  title: "Test Field",
  key: "test-field",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

const defaultProps = {
  fields: [] as Field[],
  hasUpdateRight: true,
  hasDeleteRight: true,
  hasCreateRight: true,
  onFieldReorder: vi.fn(),
  onFieldDelete: vi.fn(),
  handleFieldUpdateModalOpen: vi.fn(),
  onSchemaImport: vi.fn(),
};

describe("ModelFieldList", () => {
  const user = userEvent.setup();

  test("renders empty state when no fields and not meta", () => {
    render(<ModelFieldList {...defaultProps} fields={[]} />);
    expect(screen.getByText("Empty Schema design.", { exact: false })).toBeVisible();
  });

  test("shows import link in empty state when hasCreateRight", () => {
    render(<ModelFieldList {...defaultProps} fields={[]} />);
    expect(screen.getByText("import")).toBeVisible();
  });

  test("renders field rows with title and key", () => {
    const fields = [
      makeField({ id: "f1", title: "Name", key: "name" }),
      makeField({ id: "f2", title: "Email", key: "email", type: "URL" }),
    ];
    render(<ModelFieldList {...defaultProps} fields={fields} />);
    expect(screen.getByText("Name")).toBeVisible();
    expect(screen.getByText("#name")).toBeVisible();
    expect(screen.getByText("Email")).toBeVisible();
    expect(screen.getByText("#email")).toBeVisible();
  });

  test("shows required asterisk for required fields", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name", required: true })];
    render(<ModelFieldList {...defaultProps} fields={fields} />);
    expect(screen.getByText("Name")).toBeVisible();
    expect(screen.getByText("*", { exact: false })).toBeInTheDocument();
  });

  test("shows unique badge for unique fields", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name", unique: true })];
    render(<ModelFieldList {...defaultProps} fields={fields} />);
    expect(screen.getByText("(unique)")).toBeVisible();
  });

  test("shows title tag for isTitle fields", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name", isTitle: true })];
    render(<ModelFieldList {...defaultProps} fields={fields} />);
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("renders meta section items when isMeta is true", () => {
    render(<ModelFieldList {...defaultProps} isMeta fields={[]} />);
    expect(screen.getByText("Item Information")).toBeVisible();
    expect(screen.getByText("Publish Status")).toBeVisible();
  });

  test("calls handleFieldUpdateModalOpen on ellipsis button click", async () => {
    const handleFieldUpdateModalOpen = vi.fn();
    const fields = [makeField({ id: "f1", title: "Name", key: "name" })];
    render(
      <ModelFieldList
        {...defaultProps}
        fields={fields}
        handleFieldUpdateModalOpen={handleFieldUpdateModalOpen}
      />,
    );
    const ellipsisButton = screen.getByRole("button", { name: "ellipsis" });
    await user.click(ellipsisButton);
    expect(handleFieldUpdateModalOpen).toHaveBeenCalledWith(fields[0]);
  });

  test("disables edit button when hasUpdateRight is false", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name" })];
    render(<ModelFieldList {...defaultProps} fields={fields} hasUpdateRight={false} />);
    const ellipsisButton = screen.getByRole("button", { name: "ellipsis" });
    expect(ellipsisButton).toBeDisabled();
  });

  test("disables delete button when hasDeleteRight is false", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name" })];
    render(<ModelFieldList {...defaultProps} fields={fields} hasDeleteRight={false} />);
    const deleteButton = screen.getByRole("button", { name: "delete" });
    expect(deleteButton).toBeDisabled();
  });

  test("hides drag handle when hasUpdateRight is false", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name" })];
    const { container } = render(
      <ModelFieldList {...defaultProps} fields={fields} hasUpdateRight={false} />,
    );
    expect(container.querySelector(".grabbable")).not.toBeInTheDocument();
  });

  test("shows drag handle when hasUpdateRight is true", () => {
    const fields = [makeField({ id: "f1", title: "Name", key: "name" })];
    const { container } = render(
      <ModelFieldList {...defaultProps} fields={fields} hasUpdateRight={true} />,
    );
    expect(container.querySelector(".grabbable")).toBeInTheDocument();
  });

  test("calls onFieldDelete with field id after PopConfirm confirmation", async () => {
    const onFieldDelete = vi.fn().mockResolvedValue(undefined);
    const fields = [makeField({ id: "f1", title: "Name", key: "name" })];
    render(
      <ModelFieldList {...defaultProps} fields={fields} onFieldDelete={onFieldDelete} />,
    );
    const deleteButton = screen.getByRole("button", { name: "delete" });
    await user.click(deleteButton);
    const confirmButton = screen.getByTestId(
      DATA_TEST_ID.ModelFieldList__ConfirmDeleteFieldButton,
    );
    await user.click(confirmButton);
    expect(onFieldDelete).toHaveBeenCalledWith("f1");
  });

  test("calls onSchemaImport when import link is clicked in empty state", async () => {
    const onSchemaImport = vi.fn();
    render(<ModelFieldList {...defaultProps} fields={[]} onSchemaImport={onSchemaImport} />);
    const importLink = screen.getByText("import");
    await user.click(importLink);
    expect(onSchemaImport).toHaveBeenCalled();
  });

  test("hides import link in empty state when hasCreateRight is false", () => {
    render(<ModelFieldList {...defaultProps} fields={[]} hasCreateRight={false} />);
    expect(screen.getByText("Empty Schema design.", { exact: false })).toBeVisible();
    expect(screen.queryByText("import")).not.toBeInTheDocument();
  });
});

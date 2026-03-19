import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import ReferenceField from "./ReferenceField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Reference",
  title: "Test Field",
  key: "test-field",
  description: "Test description",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  typeProperty: { modelId: "m1" },
  ...overrides,
});

const buildReferenceProps = () => ({
  referencedItems: [] as never[],
});

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <MemoryRouter>
      <Form>{ui}</Form>
    </MemoryRouter>,
  );

describe("ReferenceField", () => {
  test("renders field title and description", () => {
    renderWithProviders(
      <ReferenceField field={makeField()} disabled={false} {...buildReferenceProps()} />,
    );
    expect(screen.getByText("Test Field")).toBeVisible();
    expect(screen.getByText("Test description")).toBeVisible();
  });

  test("renders unique indicator when field.unique=true", () => {
    renderWithProviders(
      <ReferenceField
        field={makeField({ unique: true })}
        disabled={false}
        {...buildReferenceProps()}
      />,
    );
    expect(screen.getByText("(unique)")).toBeVisible();
  });

  test("does not render Title tag even when field.isTitle=true", () => {
    renderWithProviders(
      <ReferenceField
        field={makeField({ isTitle: true })}
        disabled={false}
        {...buildReferenceProps()}
      />,
    );
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  test("renders Refer to item button", () => {
    renderWithProviders(
      <ReferenceField field={makeField()} disabled={false} {...buildReferenceProps()} />,
    );
    expect(screen.getByRole("button", { name: /Refer to item/ })).toBeVisible();
  });

  test("hides Refer to item button when disabled=true", () => {
    renderWithProviders(
      <ReferenceField field={makeField()} disabled={true} {...buildReferenceProps()} />,
    );
    expect(screen.queryByRole("button", { name: /Refer to item/ })).not.toBeInTheDocument();
  });
});

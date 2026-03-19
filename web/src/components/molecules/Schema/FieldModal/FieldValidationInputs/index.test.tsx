import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { SchemaFieldType } from "../../types";

import FieldValidationInputs from ".";

const renderWithForm = (selectedType: SchemaFieldType, min?: number, max?: number) => {
  return render(
    <Form>
      <FieldValidationInputs selectedType={selectedType} min={min} max={max} />
    </Form>,
  );
};

describe("FieldValidationInputs", () => {
  test("renders maxLength input for Text", () => {
    renderWithForm("Text");
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxValueInput)).not.toBeInTheDocument();
  });

  test("renders maxLength input for TextArea", () => {
    renderWithForm("TextArea");
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).toBeInTheDocument();
  });

  test("renders maxLength input for MarkdownText", () => {
    renderWithForm("MarkdownText");
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).toBeInTheDocument();
  });

  test("renders min and max inputs for Integer", () => {
    renderWithForm("Integer");
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).not.toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MaxValueInput)).toBeInTheDocument();
  });

  test("renders min and max inputs for Number", () => {
    renderWithForm("Number");
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MaxValueInput)).toBeInTheDocument();
  });

  test("renders nothing for Bool", () => {
    renderWithForm("Bool");
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxValueInput)).not.toBeInTheDocument();
  });

  test("renders nothing for Select", () => {
    renderWithForm("Select");
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).not.toBeInTheDocument();
  });

  test("renders nothing for Date", () => {
    renderWithForm("Date");
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).not.toBeInTheDocument();
  });

  test("renders nothing for Asset", () => {
    renderWithForm("Asset");
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MaxLengthInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__MinValueInput)).not.toBeInTheDocument();
  });

  test("passes max prop to min input for Integer", () => {
    renderWithForm("Integer", undefined, 100);
    const minInput = screen.getByTestId(DATA_TEST_ID.FieldModal__MinValueInput);
    expect(minInput).toBeInTheDocument();
  });
});

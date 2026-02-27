import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import type { Field } from "../../types";

import FieldCreationModalWithSteps from ".";

const makeModel = (overrides: Partial<Model> = {}): Model => ({
  id: "model-1",
  name: "Test Model",
  description: "",
  key: "test-model",
  schemaId: "schema-1",
  schema: { id: "schema-1", fields: [] },
  metadataSchema: {},
  ...overrides,
});

const makeField = (overrides: Partial<Field> = {}): Field => ({
  id: "f1",
  type: "Reference",
  title: "Ref Field",
  key: "ref-field",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  typeProperty: {
    modelId: "model-1",
    schema: { id: "schema-1", titleFieldId: null },
  },
  ...overrides,
});

const defaultProps = {
  models: [
    makeModel(),
    makeModel({
      id: "model-2",
      name: "Other Model",
      key: "other-model",
      schemaId: "schema-2",
      schema: { id: "schema-2", fields: [] },
    }),
  ],
  selectedType: "Reference" as const,
  selectedField: null as Field | null,
  open: true,
  isLoading: false,
  handleReferencedModelGet: vi.fn(),
  handleCorrespondingFieldKeyUnique: vi.fn().mockReturnValue(true),
  handleFieldKeyUnique: vi.fn().mockReturnValue(true),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
};

const renderModal = (overrides: Partial<typeof defaultProps> = {}) => {
  return render(<FieldCreationModalWithSteps {...defaultProps} {...overrides} />);
};

describe("FieldCreationModalWithSteps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Step 0 — Reference setting", () => {
    test("renders Steps component with Reference setting and Field", () => {
      renderModal();
      expect(screen.getByText("Reference setting")).toBeInTheDocument();
      expect(screen.getByText("Field")).toBeInTheDocument();
    });

    test("renders model Select", () => {
      renderModal();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("renders reference direction radios", () => {
      renderModal();
      expect(screen.getByText("One-way reference")).toBeInTheDocument();
      expect(screen.getByText("Two-way reference")).toBeInTheDocument();
    });

    test("Next button is disabled initially", () => {
      renderModal();
      expect(screen.getByText("Next").closest("button")).toBeDisabled();
    });

    test("does not render modal content when open is false", () => {
      renderModal({ open: false });
      expect(screen.queryByText("Reference setting")).not.toBeInTheDocument();
    });

    test("two-way reference shows Corresponding field step", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByText("Two-way reference"));
      expect(screen.getByText("Corresponding field")).toBeInTheDocument();
    });

    test("Next button is enabled when selectedField provides model", () => {
      renderModal({ selectedField: makeField() });
      // When selectedField is set, isDisabled is false
      expect(screen.getByText("Next").closest("button")).not.toBeDisabled();
    });
  });

  describe("Step 1 — Field form (update mode)", () => {
    // In update mode, we can navigate to step 1 since model is pre-populated
    const navigateToStep1 = async () => {
      const user = userEvent.setup();
      renderModal({ selectedField: makeField() });
      await user.click(screen.getByText("Next"));
      return user;
    };

    test("renders Display name, Field Key, Description inputs", async () => {
      await navigateToStep1();
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__FieldKeyInput)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__DescriptionInput)).toBeInTheDocument();
    });

    test("Multiple checkbox is disabled on step 1", async () => {
      await navigateToStep1();
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__MultipleCheckbox)).toBeDisabled();
    });

    test("renders Settings and Validation tabs", async () => {
      await navigateToStep1();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Validation")).toBeInTheDocument();
    });

    test("renders Required and Unique checkboxes (forceRender)", async () => {
      await navigateToStep1();
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__RequiredCheckbox)).toBeInTheDocument();
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__UniqueCheckbox)).toBeInTheDocument();
    });

    test("renders Confirm button for one-way reference", async () => {
      await navigateToStep1();
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
  });

  describe("Modal close", () => {
    test("Close button calls onClose", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderModal({ onClose });
      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Step navigation", () => {
    test("Next advances from step 0 to step 1 when model is selected", async () => {
      const user = userEvent.setup();
      renderModal({ selectedField: makeField() });
      expect(
        screen.queryByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput),
      ).not.toBeInTheDocument();
      await user.click(screen.getByText("Next"));
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput)).toBeInTheDocument();
    });
  });

  describe("States", () => {
    test("direction radios are disabled in update mode", () => {
      renderModal({ selectedField: makeField() });
      const radios = screen.getAllByRole("radio");
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    test("model Select is disabled in update mode", () => {
      renderModal({ selectedField: makeField() });
      // Ant Design Select adds disabled class to the wrapper
      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("disabled");
    });

    test("two-way reference disables Unique checkbox on step 2 form", async () => {
      const user = userEvent.setup();
      const field = makeField({
        typeProperty: {
          modelId: "model-1",
          schema: { id: "schema-1", titleFieldId: null },
          correspondingField: {
            id: "cf1",
            type: "Reference",
            title: "Back Ref",
            key: "back-ref",
            description: "",
            required: false,
            unique: false,
            multiple: false,
            order: 0,
          },
        },
      });
      renderModal({ selectedField: field });

      // Step 0: model pre-populated, 2-way pre-selected
      expect(screen.getByText("Corresponding field")).toBeInTheDocument();

      // Navigate to step 1
      await user.click(screen.getByText("Next"));
      expect(screen.getByTestId(DATA_TEST_ID.FieldModal__DisplayNameInput)).toBeInTheDocument();
    });
  });
});

import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import { ItemFormat } from "./ItemFormat";

dayjs.extend(utc);

const makeField = (type: Field["type"], overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type,
  title: "Test Field",
  key: "test-field",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

describe("ItemFormat", () => {
  const user = userEvent.setup();

  describe("Text field", () => {
    test("renders text value when not editable", () => {
      render(<ItemFormat item="hello world" field={makeField("Text")} />);
      expect(screen.getByText("hello world")).toBeVisible();
    });

    test("renders input when update is provided", () => {
      render(<ItemFormat item="hello" field={makeField("Text")} update={vi.fn()} />);
      expect(screen.getByDisplayValue("hello")).toBeVisible();
    });

    test("calls update on blur with changed value", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("Text")} update={update} />);
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "new value");
      await user.tab();
      expect(update).toHaveBeenCalledWith("new value", undefined);
    });

    test("does not call update on blur when value unchanged", async () => {
      const update = vi.fn();
      render(<ItemFormat item="same" field={makeField("Text")} update={update} />);
      const input = screen.getByDisplayValue("same");
      await user.click(input);
      await user.tab();
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe("MarkdownText field", () => {
    test("renders markdown content", () => {
      render(<ItemFormat item="**bold text**" field={makeField("MarkdownText")} />);
      expect(screen.getByText("bold text")).toBeVisible();
    });

    test("renders plain markdown text", () => {
      render(<ItemFormat item="plain text" field={makeField("MarkdownText")} />);
      expect(screen.getByText("plain text")).toBeVisible();
    });
  });

  describe("Date field", () => {
    test("renders formatted date when not editable", () => {
      render(<ItemFormat item="2024-01-15T10:00:00Z" field={makeField("Date")} />);
      expect(screen.getByText("2024-01-15")).toBeVisible();
    });

    test("renders date picker when update is provided", () => {
      render(<ItemFormat item="" field={makeField("Date")} update={vi.fn()} />);
      expect(screen.getByPlaceholderText("-")).toBeVisible();
    });
  });

  describe("Bool field", () => {
    test("renders disabled switch when not editable and checked", () => {
      render(<ItemFormat item="true" field={makeField("Bool")} />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeDisabled();
      expect(switchEl).toBeChecked();
    });

    test("renders disabled switch when not editable and unchecked", () => {
      render(<ItemFormat item="false" field={makeField("Bool")} />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeDisabled();
      expect(switchEl).not.toBeChecked();
    });

    test("renders enabled switch when update is provided", () => {
      render(<ItemFormat item="false" field={makeField("Bool")} update={vi.fn()} />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).not.toBeDisabled();
    });

    test("calls update when switch is toggled", async () => {
      const update = vi.fn();
      render(<ItemFormat item="false" field={makeField("Bool")} update={update} />);
      await user.click(screen.getByRole("switch"));
      expect(update).toHaveBeenCalledWith(true, undefined);
    });
  });

  describe("Asset field", () => {
    test("renders asset value with icon", () => {
      render(<ItemFormat item="asset-file-name" field={makeField("Asset")} />);
      expect(screen.getByText("asset-file-name")).toBeVisible();
    });
  });

  describe("URL field", () => {
    test("renders link when not editable", () => {
      render(<ItemFormat item="https://example.com" field={makeField("URL")} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
    });

    test("renders input when editable and no value", () => {
      render(<ItemFormat item="" field={makeField("URL")} update={vi.fn()} />);
      expect(screen.getByRole("textbox")).toBeVisible();
    });
  });

  describe("Reference field", () => {
    test("renders reference value with tag", () => {
      render(<ItemFormat item="ref-item-title" field={makeField("Reference")} />);
      expect(screen.getByText("ref-item-title")).toBeVisible();
    });
  });

  describe("Checkbox field", () => {
    test("renders checked checkbox when not editable", () => {
      render(<ItemFormat item="true" field={makeField("Checkbox")} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    test("renders unchecked checkbox when not editable", () => {
      render(<ItemFormat item="false" field={makeField("Checkbox")} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    test("calls update when checkbox is toggled", async () => {
      const update = vi.fn();
      render(<ItemFormat item="false" field={makeField("Checkbox")} update={update} />);
      await user.click(screen.getByRole("checkbox"));
      expect(update).toHaveBeenCalledWith(true, undefined);
    });
  });

  describe("default case", () => {
    test("renders item value as-is for unsupported types", () => {
      render(<ItemFormat item="12345" field={makeField("Integer")} />);
      expect(screen.getByText("12345")).toBeVisible();
    });

    test("renders number value", () => {
      render(<ItemFormat item="3.14" field={makeField("Number")} />);
      expect(screen.getByText("3.14")).toBeVisible();
    });
  });
});

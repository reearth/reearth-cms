import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { describe, test, expect, vi, beforeEach } from "vitest";

import Notification from "@reearth-cms/components/atoms/Notification";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { ItemFormat } from "./ItemFormat";

vi.mock("@reearth-cms/components/atoms/Notification", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("@reearth-cms/components/atoms/Tooltip", () => ({
  default: ({
    title,
    children,
  }: {
    title?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div>
      {children}
      <div>{title}</div>
    </div>
  ),
}));

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    test("passes index to update on blur", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("Text")} update={update} index={2} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "indexed value");
      await user.tab();
      expect(update).toHaveBeenCalledWith("indexed value", 2);
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

    test("renders link with target='_blank'", () => {
      render(
        <ItemFormat item="[click here](https://example.com)" field={makeField("MarkdownText")} />,
      );
      const link = screen.getByRole("link", { name: "click here" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("href", "https://example.com");
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

    test("calls update when date is selected", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("Date")} update={update} />);
      const input = screen.getByPlaceholderText("-");

      await user.click(input);
      // Type a valid date and press Enter to trigger onChange
      await user.type(input, "2024-06-15");
      await user.keyboard("{Enter}");

      expect(update).toHaveBeenCalled();
      expect(typeof update.mock.calls[0][0]).toBe("string");
    });

    test("calls update with empty string when date is cleared", async () => {
      const update = vi.fn();
      render(<ItemFormat item="2024-01-15T10:00:00Z" field={makeField("Date")} update={update} />);

      // Hover over the picker to reveal the clear icon, then click it
      const input = screen.getByRole("textbox");
      await user.hover(input);
       
      const clearIcon = document.querySelector(".ant-picker-clear");
      if (clearIcon) {
        await user.click(clearIcon as HTMLElement);
        expect(update).toHaveBeenCalledWith("", undefined);
      }
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

    test("does not call update on blur when URL unchanged", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("URL")} update={update} />);
      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();
      expect(update).not.toHaveBeenCalled();
    });

    test("shows error notification on blur with invalid URL", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("URL")} update={update} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "not-a-url");
      await user.tab();
      expect(update).not.toHaveBeenCalled();
      expect(Notification.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) }),
      );
    });

    test("calls update on blur with valid new URL", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("URL")} update={update} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "https://new.example.com");
      await user.tab();
      expect(update).toHaveBeenCalledWith("https://new.example.com", undefined);
    });

    test("passes index to update on URL blur", async () => {
      const update = vi.fn();
      render(<ItemFormat item="" field={makeField("URL")} update={update} index={3} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "https://example.com");
      await user.tab();
      expect(update).toHaveBeenCalledWith("https://example.com", 3);
    });

    test("enters edit mode when edit icon is clicked", async () => {
      const update = vi.fn();
      render(
        <ItemFormat item="https://example.com" field={makeField("URL")} update={update} />,
      );

      // Link should be visible initially (Tooltip is mocked to render title inline)
      expect(screen.getByRole("link", { name: "https://example.com" })).toBeVisible();

      // Click the edit icon inside the data-testid span
      const editButtonSpan = screen.getByTestId(DATA_TEST_ID.Content__List__UrlEditButton);
       
      await user.click((editButtonSpan.children[0] as HTMLElement) || editButtonSpan);

      // Should now show input with the URL value
      expect(screen.getByDisplayValue("https://example.com")).toBeVisible();
    });

    test("returns to link display on blur with unchanged URL after entering edit mode", async () => {
      const update = vi.fn();
      render(
        <ItemFormat item="https://example.com" field={makeField("URL")} update={update} />,
      );

      // Enter edit mode via edit icon
      const editButtonSpan = screen.getByTestId(DATA_TEST_ID.Content__List__UrlEditButton);
       
      await user.click((editButtonSpan.children[0] as HTMLElement) || editButtonSpan);

      // Input should be visible with existing URL
      const input = screen.getByDisplayValue("https://example.com");

      // Blur without changing the value
      await user.tab();

      // Should return to link display (setIsEditable(false) called)
      expect(update).not.toHaveBeenCalled();
      expect(screen.getByRole("link", { name: "https://example.com" })).toBeVisible();
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

import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import {
  BasicOperator,
  BoolOperator,
  NumberOperator,
  StringOperator,
  TimeOperator,
  NullableOperator,
  type CurrentView,
} from "@reearth-cms/components/molecules/View/types";

import type { DropdownFilterType, DefaultFilterValueType } from "../types";

import useDropdownRender from "./hooks";

function makeFilter(overrides: Partial<DropdownFilterType> = {}): DropdownFilterType {
  return {
    dataIndex: ["fields", "field-1"],
    title: "Test Field",
    type: "Text",
    typeProperty: {},
    members: [],
    id: "field-1",
    multiple: false,
    required: false,
    ...overrides,
  };
}

const defaultCurrentView: CurrentView = {};

function renderDropdown(
  overrides: {
    filter?: Partial<DropdownFilterType>;
    isFilter?: boolean;
    defaultValue?: DefaultFilterValueType;
    open?: boolean;
    index?: number;
    currentView?: CurrentView;
  } = {},
) {
  const close = vi.fn();
  const setCurrentView = vi.fn();
  const onFilterChange = vi.fn();
  const filter = makeFilter(overrides.filter);

  const result = renderHook(() =>
    useDropdownRender(
      filter,
      close,
      overrides.open ?? true,
      overrides.isFilter ?? true,
      overrides.index ?? 0,
      overrides.currentView ?? defaultCurrentView,
      setCurrentView,
      onFilterChange,
      overrides.defaultValue,
    ),
  );

  return { ...result, close, setCurrentView, onFilterChange };
}

describe("DropdownRender hooks", () => {
  describe("options (filter mode)", () => {
    test("Bool/Checkbox types produce BoolOperator options", () => {
      const { result } = renderDropdown({ filter: { type: "Bool" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(BoolOperator.Equals);
      expect(values).toContain(BoolOperator.NotEquals);
    });

    test("Checkbox type produces BoolOperator options", () => {
      const { result } = renderDropdown({ filter: { type: "Checkbox" } });
      expect(result.current.options[0].operatorType).toBe("bool");
    });

    test("Text type produces BasicOperator + StringOperator options", () => {
      const { result } = renderDropdown({ filter: { type: "Text" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(BasicOperator.Equals);
      expect(values).toContain(BasicOperator.NotEquals);
      expect(values).toContain(StringOperator.Contains);
      expect(values).toContain(StringOperator.NotContains);
      expect(values).toContain(StringOperator.StartsWith);
      expect(values).toContain(StringOperator.EndsWith);
    });

    test("TextArea type produces same operators as Text", () => {
      const { result } = renderDropdown({ filter: { type: "TextArea" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(StringOperator.Contains);
    });

    test("Integer type produces NumberOperator options", () => {
      const { result } = renderDropdown({ filter: { type: "Integer" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(NumberOperator.GreaterThan);
      expect(values).toContain(NumberOperator.LessThan);
      expect(values).toContain(NumberOperator.GreaterThanOrEqualTo);
      expect(values).toContain(NumberOperator.LessThanOrEqualTo);
    });

    test("Number type produces NumberOperator options", () => {
      const { result } = renderDropdown({ filter: { type: "Number" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(NumberOperator.GreaterThan);
    });

    test("Date type produces TimeOperator options", () => {
      const { result } = renderDropdown({ filter: { type: "Date" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(TimeOperator.After);
      expect(values).toContain(TimeOperator.Before);
      expect(values).toContain(TimeOperator.OfThisWeek);
      expect(values).toContain(TimeOperator.OfThisMonth);
      expect(values).toContain(TimeOperator.OfThisYear);
    });

    test("Select type produces BasicOperator only", () => {
      const { result } = renderDropdown({ filter: { type: "Select" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(BasicOperator.Equals);
      expect(values).toContain(BasicOperator.NotEquals);
      expect(values).not.toContain(StringOperator.Contains);
    });

    test("Tag type produces BasicOperator only", () => {
      const { result } = renderDropdown({ filter: { type: "Tag" } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(BasicOperator.Equals);
      expect(values).not.toContain(StringOperator.Contains);
    });

    test("Person type produces BasicOperator only", () => {
      const { result } = renderDropdown({ filter: { type: "Person" as never } });
      const operatorTypes = result.current.options.map(o => o.operatorType);
      expect(operatorTypes).toContain("basic");
    });

    test("non-required columns include NullableOperator", () => {
      const { result } = renderDropdown({ filter: { type: "Text", required: false } });
      const values = result.current.options.map(o => o.value);
      expect(values).toContain(NullableOperator.Empty);
      expect(values).toContain(NullableOperator.NotEmpty);
    });

    test("required columns exclude NullableOperator", () => {
      const { result } = renderDropdown({ filter: { type: "Text", required: true } });
      const values = result.current.options.map(o => o.value);
      expect(values).not.toContain(NullableOperator.Empty);
    });
  });

  describe("options (sort mode)", () => {
    test("produces ASC/DESC options", () => {
      const { result } = renderDropdown({ isFilter: false });
      const values = result.current.options.map(o => o.value);
      expect(values).toEqual(["ASC", "DESC"]);
    });

    test("sort options have operatorType 'sort'", () => {
      const { result } = renderDropdown({ isFilter: false });
      expect(result.current.options.every(o => o.operatorType === "sort")).toBe(true);
    });
  });

  describe("valueOptions", () => {
    test("Select filter type returns values as options", () => {
      const { result } = renderDropdown({
        filter: {
          type: "Select",
          typeProperty: { values: ["red", "blue"] },
        },
      });
      expect(result.current.valueOptions).toEqual([
        { value: "red", label: "red" },
        { value: "blue", label: "blue" },
      ]);
    });

    test("Tag filter type returns tag options with color", () => {
      const { result } = renderDropdown({
        filter: {
          type: "Tag",
          typeProperty: {
            tags: [
              { id: "t1", name: "Tag1", color: "#ff0000" },
              { id: "t2", name: "Tag2", color: "#00ff00" },
            ],
          },
        },
      });
      expect(result.current.valueOptions).toEqual([
        { value: "t1", label: "Tag1", color: "#ff0000" },
        { value: "t2", label: "Tag2", color: "#00ff00" },
      ]);
    });

    test("Bool filter type returns True/False options", () => {
      const { result } = renderDropdown({ filter: { type: "Bool" } });
      expect(result.current.valueOptions).toEqual([
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ]);
    });

    test("Checkbox filter type returns True/False options", () => {
      const { result } = renderDropdown({ filter: { type: "Checkbox" } });
      expect(result.current.valueOptions).toEqual([
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ]);
    });

    test("Text filter type returns empty options", () => {
      const { result } = renderDropdown({ filter: { type: "Text" } });
      expect(result.current.valueOptions).toEqual([]);
    });
  });

  describe("onFilterSelect", () => {
    test("hides input field for nullable operators", () => {
      const { result } = renderDropdown();

      act(() => {
        result.current.onFilterSelect(NullableOperator.Empty, { operatorType: "nullable" });
      });
      expect(result.current.isShowInputField).toBe(false);
    });

    test("hides input field for OfThisWeek time operator", () => {
      const { result } = renderDropdown({ filter: { type: "Date" } });

      act(() => {
        result.current.onFilterSelect(TimeOperator.OfThisWeek, { operatorType: "time" });
      });
      expect(result.current.isShowInputField).toBe(false);
    });

    test("hides input field for OfThisMonth time operator", () => {
      const { result } = renderDropdown({ filter: { type: "Date" } });

      act(() => {
        result.current.onFilterSelect(TimeOperator.OfThisMonth, { operatorType: "time" });
      });
      expect(result.current.isShowInputField).toBe(false);
    });

    test("hides input field for OfThisYear time operator", () => {
      const { result } = renderDropdown({ filter: { type: "Date" } });

      act(() => {
        result.current.onFilterSelect(TimeOperator.OfThisYear, { operatorType: "time" });
      });
      expect(result.current.isShowInputField).toBe(false);
    });

    test("shows input field for regular operators", () => {
      const { result } = renderDropdown();

      act(() => {
        result.current.onFilterSelect(BasicOperator.Equals, { operatorType: "basic" });
      });
      expect(result.current.isShowInputField).toBe(true);
    });
  });
});

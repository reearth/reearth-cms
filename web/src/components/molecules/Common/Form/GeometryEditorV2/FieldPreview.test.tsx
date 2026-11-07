import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Geometry } from "geojson";
import { describe, expect, test, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";

import type { GeometryIssue } from "./core/validation";
import FieldPreview from "./FieldPreview";

// OpenLayers can't render in jsdom; what matters here is the bar, the notices and the actions.
vi.mock("./map/useOlMap", () => ({ useOlMap: () => null }));

const ISSUE: GeometryIssue = {
  path: "coordinates",
  message: "Longitude must be between -180 and 180",
};

type SetupOptions = {
  geometries?: Geometry[];
  issues?: GeometryIssue[];
  disabled?: boolean;
};

const setup = ({
  geometries = [Test.GEO_JSON_LINE_STRING],
  issues = [],
  disabled = false,
}: SetupOptions = {}) => {
  const callbacks = { onOpen: vi.fn(), onCopy: vi.fn(), onClear: vi.fn() };
  render(
    <FieldPreview
      collection={GeoUtils.toCollection(geometries)}
      issues={issues}
      disabled={disabled}
      {...callbacks}
    />,
  );
  return callbacks;
};

// A button with an icon and text is named after both (e.g. "edit Edit geometry").
const named = (name: string) => (accessibleName: string) => accessibleName.endsWith(name);
const button = (name: string) => screen.getByRole("button", { name: named(name) });
const buttons = (name: string) => screen.queryAllByRole("button", { name: named(name) });

describe("FieldPreview", () => {
  test.each<[string, SetupOptions, string]>([
    ["an empty value", { geometries: [] }, "No geometry"],
    ["one geometry", {}, "Line · 4 vertices"],
    ["a value with problems", { issues: [ISSUE] }, "Invalid value"],
  ])("sums up %s", (_, options, summary) => {
    setup(options);
    expect(screen.getByText(summary)).toBeInTheDocument();
  });

  describe("an empty value", () => {
    test("offers to add a geometry", async () => {
      const user = userEvent.setup();
      const { onOpen } = setup({ geometries: [] });
      expect(screen.getByText("No geometry yet")).toBeInTheDocument();
      await user.click(button("Add geometry"));
      expect(onOpen).toHaveBeenCalled();
    });

    test("has nothing to fly to, copy, clear or edit", () => {
      setup({ geometries: [] });
      for (const name of ["Fly to geometries", "Copy GeoJSON", "Clear", "Edit geometry"]) {
        expect(buttons(name)).toHaveLength(0);
      }
    });

    test("offers no Add when disabled", () => {
      setup({ geometries: [], disabled: true });
      expect(buttons("Add geometry")).toHaveLength(0);
    });
  });

  describe("a value", () => {
    test.each<[string, "onCopy" | "onOpen"]>([
      ["Copy GeoJSON", "onCopy"],
      ["Edit geometry", "onOpen"],
    ])("%s calls %s", async (name, callback) => {
      const user = userEvent.setup();
      const callbacks = setup();
      await user.click(button(name));
      expect(callbacks[callback]).toHaveBeenCalled();
    });

    test("Clear asks first, then clears", async () => {
      const user = userEvent.setup();
      const { onClear } = setup();
      await user.click(button("Clear"));
      expect(onClear).not.toHaveBeenCalled();
      expect(await screen.findByText("Clear this geometry?")).toBeInTheDocument();
      // The confirm's own button is the second one named Clear.
      await user.click(buttons("Clear")[1]);
      expect(onClear).toHaveBeenCalled();
    });

    test("disabled: View instead of Edit, and no Clear", async () => {
      const user = userEvent.setup();
      const { onOpen } = setup({ disabled: true });
      expect(buttons("Edit geometry")).toHaveLength(0);
      expect(buttons("Clear")).toHaveLength(0);
      await user.click(button("View"));
      expect(onOpen).toHaveBeenCalled();
    });
  });

  describe("an invalid value", () => {
    test("shows the problem and a way to fix it", async () => {
      const user = userEvent.setup();
      const { onOpen } = setup({ issues: [ISSUE] });
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("This value is not valid GeoJSON");
      expect(alert).toHaveTextContent("coordinates: Longitude must be between -180 and 180");
      await user.click(button("Fix in editor"));
      expect(onOpen).toHaveBeenCalled();
    });

    test("offers no fix when disabled", () => {
      setup({ issues: [ISSUE], disabled: true });
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(buttons("Fix in editor")).toHaveLength(0);
    });
  });
});

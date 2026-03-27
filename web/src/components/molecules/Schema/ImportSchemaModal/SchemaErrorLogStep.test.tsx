import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { t } from "@reearth-cms/i18n";
import { ErrorLogMeta } from "@reearth-cms/utils/importErrorLog";

import SchemaErrorLogStep from "./SchemaErrorLogStep";

const mockErrorLogMeta: ErrorLogMeta = {
  fileName: "schema.json",
  source: "schema",
  totalErrors: 3,
  entries: [
    {
      path: ["properties", "age", "x-defaultValue"],
      detail: "Expected number, received string",
    },
    {
      path: ["properties", "name", "x-fieldType"],
      detail: "Invalid enum value",
    },
    {
      path: ["properties", "geo", "x-geoSupportedTypes"],
      detail: "Invalid input: expected POINT, LINE",
    },
  ],
};

describe("SchemaErrorLogStep", () => {
  test("renders alert with validation errors message and description", () => {
    render(<SchemaErrorLogStep errorLogMeta={mockErrorLogMeta} />);

    expect(screen.getByText(t("Validation errors"))).toBeInTheDocument();
    expect(
      screen.getByText(t("You can preview errors here or download the error log")),
    ).toBeInTheDocument();
  });

  test("displays error count badge", () => {
    render(<SchemaErrorLogStep errorLogMeta={mockErrorLogMeta} />);

    expect(screen.getByText("3 errors")).toBeInTheDocument();
  });

  test("renders table with Location and Detail columns", () => {
    render(<SchemaErrorLogStep errorLogMeta={mockErrorLogMeta} />);

    expect(screen.getByText(t("Location"))).toBeInTheDocument();
    expect(screen.getByText(t("Detail"))).toBeInTheDocument();
  });

  test("renders table rows with formatted schema paths", () => {
    render(<SchemaErrorLogStep errorLogMeta={mockErrorLogMeta} />);

    // formatSchemaPath converts ["properties", "age", "x-defaultValue"] → 'Field "age" > Default value'
    expect(screen.getByText(/Field "age" > Default value/)).toBeInTheDocument();
    expect(screen.getByText(/Field "name" > Field type/)).toBeInTheDocument();
    expect(screen.getByText(/Field "geo" > Supported types/)).toBeInTheDocument();

    expect(screen.getByText("Expected number, received string")).toBeInTheDocument();
    expect(screen.getByText("Invalid enum value")).toBeInTheDocument();
    expect(screen.getByText("Invalid input: expected POINT, LINE")).toBeInTheDocument();
  });

  test("does not render table when errorLogMeta is null", () => {
    render(<SchemaErrorLogStep errorLogMeta={null} />);

    expect(screen.getByText(t("Validation errors"))).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("does not render table when entries array is empty", () => {
    const emptyMeta: ErrorLogMeta = {
      ...mockErrorLogMeta,
      entries: [],
    };
    render(<SchemaErrorLogStep errorLogMeta={emptyMeta} />);

    expect(screen.getByText(t("Validation errors"))).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("does not render error count badge when errorLogMeta is null", () => {
    render(<SchemaErrorLogStep errorLogMeta={null} />);

    expect(screen.queryByText(/\d+ errors/)).not.toBeInTheDocument();
  });
});

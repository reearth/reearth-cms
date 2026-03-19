import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID, render } from "@reearth-cms/test/utils";

import { PreviewTypeSelect } from "./previewTypeSelect";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));

describe("PreviewTypeSelect", () => {
  test("renders with correct data-testid", () => {
    render(<PreviewTypeSelect value="IMAGE" onTypeChange={vi.fn()} hasUpdateRight={true} />);
    expect(screen.getByTestId(DATA_TEST_ID.AssetDetail__TypeSelect)).toBeInTheDocument();
  });

  test("is disabled when hasUpdateRight is false", () => {
    render(<PreviewTypeSelect value="IMAGE" onTypeChange={vi.fn()} hasUpdateRight={false} />);
    const select = screen.getByTestId(DATA_TEST_ID.AssetDetail__TypeSelect);
    expect(select).toHaveClass("ant-select-disabled");
  });

  test("is enabled when hasUpdateRight is true", () => {
    render(<PreviewTypeSelect value="IMAGE" onTypeChange={vi.fn()} hasUpdateRight={true} />);
    const select = screen.getByTestId(DATA_TEST_ID.AssetDetail__TypeSelect);
    expect(select).not.toHaveClass("ant-select-disabled");
  });
});

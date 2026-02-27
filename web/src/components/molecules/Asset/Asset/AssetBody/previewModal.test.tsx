import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { render } from "@reearth-cms/test/utils";

import PreviewModal from "./previewModal";

describe("PreviewModal", () => {
  test("renders image with correct src when visible", () => {
    render(
      <PreviewModal url="https://example.com/image.png" visible={true} onCancel={vi.fn()} />,
    );
    const img = screen.getByAltText("asset-preview");
    expect(img).toHaveAttribute("src", "https://example.com/image.png");
  });

  test("does not show image when not visible", () => {
    render(
      <PreviewModal url="https://example.com/image.png" visible={false} onCancel={vi.fn()} />,
    );
    expect(screen.queryByAltText("asset-preview")).not.toBeInTheDocument();
  });

  test("calls onCancel when modal close triggered", () => {
    const onCancel = vi.fn();
    render(<PreviewModal url="https://example.com/image.png" visible={true} onCancel={onCancel} />);
    const closeButton = screen.getByRole("button", { name: "Close" });
    closeButton.click();
    expect(onCancel).toHaveBeenCalled();
  });
});

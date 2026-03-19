import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { render } from "@reearth-cms/test/utils";

import PreviewToolbar from "./previewToolbar";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));
vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));
vi.mock("@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewModal", () => ({
  default: () => <div data-testid="preview-modal" />,
}));

const defaultProps = {
  url: "https://example.com/image.png",
  isModalVisible: false,
  onCodeSourceClick: vi.fn(),
  onRenderClick: vi.fn(),
  onFullScreen: vi.fn(),
  onModalCancel: vi.fn(),
};

describe("PreviewToolbar", () => {
  test("shows Source Code and Render buttons when viewerType is image_svg", () => {
    render(<PreviewToolbar {...defaultProps} viewerType="image_svg" />);
    expect(screen.getByText("Source Code")).toBeInTheDocument();
    expect(screen.getByText("Render")).toBeInTheDocument();
  });

  test("hides SVG buttons for other viewer types", () => {
    render(<PreviewToolbar {...defaultProps} viewerType="image" />);
    expect(screen.queryByText("Source Code")).not.toBeInTheDocument();
    expect(screen.queryByText("Render")).not.toBeInTheDocument();
  });

  test("shows fullscreen button when viewerType is not unknown", () => {
    render(<PreviewToolbar {...defaultProps} viewerType="image" />);
    expect(screen.getByTestId("icon-fullscreen")).toBeInTheDocument();
  });

  test("hides fullscreen button when viewerType is unknown", () => {
    render(<PreviewToolbar {...defaultProps} viewerType="unknown" />);
    expect(screen.queryByTestId("icon-fullscreen")).not.toBeInTheDocument();
  });

  test("calls onCodeSourceClick on Source Code click", () => {
    const onCodeSourceClick = vi.fn();
    render(
      <PreviewToolbar
        {...defaultProps}
        viewerType="image_svg"
        onCodeSourceClick={onCodeSourceClick}
      />,
    );
    screen.getByText("Source Code").click();
    expect(onCodeSourceClick).toHaveBeenCalledOnce();
  });

  test("calls onRenderClick on Render click", () => {
    const onRenderClick = vi.fn();
    render(
      <PreviewToolbar {...defaultProps} viewerType="image_svg" onRenderClick={onRenderClick} />,
    );
    screen.getByText("Render").click();
    expect(onRenderClick).toHaveBeenCalledOnce();
  });

  test("calls onFullScreen on fullscreen button click", () => {
    const onFullScreen = vi.fn();
    render(<PreviewToolbar {...defaultProps} viewerType="image" onFullScreen={onFullScreen} />);
    const button = screen.getByTestId("icon-fullscreen").closest("button");
    if (!button) return;
    button.click();
    expect(onFullScreen).toHaveBeenCalledOnce();
  });
});

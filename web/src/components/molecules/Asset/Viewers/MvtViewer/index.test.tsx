import { render, screen, act } from "@testing-library/react";
import { Viewer as CesiumViewer } from "cesium";
import { createRef } from "react";
import { CesiumComponentRef } from "resium";
import { describe, expect, test, vi } from "vitest";

let capturedHandleProperties: ((prop: unknown) => void) | undefined;

vi.mock("@reearth-cms/components/atoms/ResiumViewer", () => ({
  default: ({ children, properties }: { children: React.ReactNode; properties?: unknown }) => (
    <div data-testid="resium-viewer" data-properties={JSON.stringify(properties ?? null)}>
      {children}
    </div>
  ),
}));

vi.mock("./Imagery", () => ({
  Imagery: ({ handleProperties }: { handleProperties: (prop: unknown) => void }) => {
    capturedHandleProperties = handleProperties;
    return <div data-testid="imagery" />;
  },
}));

import MvtViewer from ".";

const defaultProps = {
  url: "https://example.com/tiles/12/345/678.mvt",
  viewerRef: createRef<CesiumComponentRef<CesiumViewer>>(),
  workspaceSettings: {},
} as const;

describe("MvtViewer", () => {
  test("renders ResiumViewer wrapping Imagery", () => {
    render(<MvtViewer {...defaultProps} />);
    expect(screen.getByTestId("resium-viewer")).toBeInTheDocument();
    expect(screen.getByTestId("imagery")).toBeInTheDocument();
  });

  test("handleProperties with valid object sets properties", () => {
    render(<MvtViewer {...defaultProps} />);
    act(() => {
      capturedHandleProperties?.({ key: "val" });
    });
    expect(screen.getByTestId("resium-viewer")).toHaveAttribute(
      "data-properties",
      JSON.stringify({ key: "val" }),
    );
  });

  test("handleProperties with null sets properties to undefined", () => {
    render(<MvtViewer {...defaultProps} />);
    act(() => {
      capturedHandleProperties?.(null);
    });
    expect(screen.getByTestId("resium-viewer")).toHaveAttribute("data-properties", "null");
  });

  test("handleProperties with string sets properties to undefined", () => {
    render(<MvtViewer {...defaultProps} />);
    act(() => {
      capturedHandleProperties?.("str");
    });
    expect(screen.getByTestId("resium-viewer")).toHaveAttribute("data-properties", "null");
  });

  test("handleProperties with undefined sets properties to undefined", () => {
    render(<MvtViewer {...defaultProps} />);
    act(() => {
      capturedHandleProperties?.(undefined);
    });
    expect(screen.getByTestId("resium-viewer")).toHaveAttribute("data-properties", "null");
  });
});

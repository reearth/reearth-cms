import { render, screen } from "@testing-library/react";
import { Viewer as CesiumViewer } from "cesium";
import { createRef } from "react";
import { CesiumComponentRef } from "resium";
import { beforeEach, describe, expect, test, vi } from "vitest";

let capturedImageryProps: { isAssetPublic?: boolean; url: string } | undefined;

vi.mock("@reearth-cms/components/atoms/ResiumViewer", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resium-viewer">{children}</div>
  ),
}));

vi.mock("./Imagery", () => ({
  Imagery: (props: { isAssetPublic?: boolean; url: string }) => {
    capturedImageryProps = props;
    return <div data-testid="imagery" />;
  },
}));

import CsvViewer from ".";

const defaultProps = {
  url: "https://example.com/data.csv",
  viewerRef: createRef<CesiumComponentRef<CesiumViewer>>(),
  workspaceSettings: {},
} as const;

describe("CsvViewer", () => {
  beforeEach(() => {
    capturedImageryProps = undefined;
  });

  test("renders ResiumViewer wrapping Imagery", () => {
    render(<CsvViewer {...defaultProps} />);
    expect(screen.getByTestId("resium-viewer")).toBeInTheDocument();
    expect(screen.getByTestId("imagery")).toBeInTheDocument();
  });

  test("Imagery is a child of ResiumViewer in the DOM", () => {
    render(<CsvViewer {...defaultProps} />);
    const viewer = screen.getByTestId("resium-viewer");
    const imagery = screen.getByTestId("imagery");
    expect(viewer).toContainElement(imagery);
  });

  test("passes url and isAssetPublic to Imagery", () => {
    render(<CsvViewer {...defaultProps} isAssetPublic={true} />);
    expect(capturedImageryProps).toEqual({
      url: "https://example.com/data.csv",
      isAssetPublic: true,
    });
  });
});

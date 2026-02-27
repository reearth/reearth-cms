import { render, screen } from "@testing-library/react";
import { Viewer as CesiumViewer } from "cesium";
import { createRef } from "react";
import { CesiumComponentRef } from "resium";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/components/atoms/ResiumViewer", () => ({
  default: ({
    children,
    showDescription,
  }: {
    children: React.ReactNode;
    showDescription?: boolean;
  }) => (
    <div data-testid="resium-viewer" data-show-description={String(!!showDescription)}>
      {children}
    </div>
  ),
}));

vi.mock("./CzmlComponent", () => ({
  default: () => <div data-testid="czml-component" />,
}));

vi.mock("./GeoJsonComponent", () => ({
  default: () => <div data-testid="geojson-component" />,
}));

vi.mock("./KmlComponent", () => ({
  default: () => <div data-testid="kml-component" />,
}));

import GeoViewer from ".";

const defaultProps = {
  url: "https://example.com/data.geojson",
  viewerRef: createRef<CesiumComponentRef<CesiumViewer>>(),
  workspaceSettings: {},
} as const;

describe("GeoViewer", () => {
  test(".czml URL renders CzmlComponent", () => {
    render(<GeoViewer {...defaultProps} url="https://example.com/data.czml" />);
    expect(screen.getByTestId("czml-component")).toBeInTheDocument();
    expect(screen.queryByTestId("kml-component")).not.toBeInTheDocument();
    expect(screen.queryByTestId("geojson-component")).not.toBeInTheDocument();
  });

  test(".kml URL renders KmlComponent", () => {
    render(<GeoViewer {...defaultProps} url="https://example.com/data.kml" />);
    expect(screen.getByTestId("kml-component")).toBeInTheDocument();
    expect(screen.queryByTestId("czml-component")).not.toBeInTheDocument();
    expect(screen.queryByTestId("geojson-component")).not.toBeInTheDocument();
  });

  test(".geojson URL renders GeoJsonComponent", () => {
    render(<GeoViewer {...defaultProps} url="https://example.com/data.geojson" />);
    expect(screen.getByTestId("geojson-component")).toBeInTheDocument();
    expect(screen.queryByTestId("czml-component")).not.toBeInTheDocument();
    expect(screen.queryByTestId("kml-component")).not.toBeInTheDocument();
  });

  test("unknown extension defaults to GeoJsonComponent", () => {
    render(<GeoViewer {...defaultProps} url="https://example.com/data.xyz" />);
    expect(screen.getByTestId("geojson-component")).toBeInTheDocument();
  });

  test("extension matching is case-insensitive", () => {
    render(<GeoViewer {...defaultProps} url="https://example.com/data.KML" />);
    expect(screen.getByTestId("kml-component")).toBeInTheDocument();
  });

  test("showDescription is true only for czml", () => {
    const { rerender } = render(
      <GeoViewer {...defaultProps} url="https://example.com/data.czml" />,
    );
    expect(screen.getByTestId("resium-viewer")).toHaveAttribute("data-show-description", "true");

    rerender(<GeoViewer {...defaultProps} url="https://example.com/data.geojson" />);
    expect(screen.getByTestId("resium-viewer")).toHaveAttribute("data-show-description", "false");
  });
});
